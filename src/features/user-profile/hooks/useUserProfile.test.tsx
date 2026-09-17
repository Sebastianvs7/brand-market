import { act, renderHook, waitFor } from '@testing-library/react-native';
import { StrictMode, type PropsWithChildren } from 'react';
import { ApiError } from '@/shared/api/apiError';
import { deferred } from '@/testing/deferred';
import { getUser } from '../api/getUser';
import type { User } from '../schemas/user.schema';
import { useUserProfile } from './useUserProfile';

jest.mock('../api/getUser');
const fetchUser = jest.mocked(getUser);
const alice: User = { id: 1, firstName: 'Alice', lastName: 'Example', email: 'alice@example.com' };
const bob: User = { ...alice, id: 2, firstName: 'Bob' };
beforeEach(() => fetchUser.mockReset());

it('loads and notifies once; callback changes do not cause another request', async () => {
  const pending = deferred<User>();
  fetchUser.mockReturnValue(pending.promise);
  const first = jest.fn();
  const latest = jest.fn();
  const { result, rerender } = await renderHook(
    (callback: (user: User) => void) => useUserProfile(1, callback),
    { initialProps: first },
  );
  await rerender(latest);
  await act(async () => {
    pending.resolve(alice);
  });
  expect(result.current.profileState).toMatchObject({ status: 'success', user: alice });
  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledTimes(1);
  expect(fetchUser).toHaveBeenCalledTimes(1);
});

it('switches identity and ignores an older successful response', async () => {
  const oldRequest = deferred<User>();
  const newRequest = deferred<User>();
  fetchUser.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise);
  const callback = jest.fn();
  const { result, rerender } = await renderHook((id: number) => useUserProfile(id, callback), {
    initialProps: 1,
  });
  const oldSignal = fetchUser.mock.calls[0]?.[1];
  await rerender(2);
  expect(result.current.profileState).toMatchObject({ status: 'loading', userId: 2 });
  expect(oldSignal?.aborted).toBe(true);
  await act(async () => {
    newRequest.resolve(bob);
  });
  await act(async () => {
    oldRequest.resolve(alice);
  });
  expect(result.current.profileState).toMatchObject({ status: 'success', user: bob });
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(bob);
});

it('ignores a stale failure while the new request is loading', async () => {
  const oldRequest = deferred<User>();
  fetchUser.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(deferred<User>().promise);
  const { result, rerender } = await renderHook((id: number) => useUserProfile(id), {
    initialProps: 1,
  });
  await rerender(2);
  await act(async () => {
    oldRequest.reject(new ApiError('network'));
  });
  expect(result.current.profileState).toMatchObject({ status: 'loading', userId: 2 });
});

it('aborts and never notifies after unmount', async () => {
  const pending = deferred<User>();
  fetchUser.mockReturnValue(pending.promise);
  const callback = jest.fn();
  const { unmount } = await renderHook(() => useUserProfile(1, callback));
  const signal = fetchUser.mock.calls[0]?.[1];
  await unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => {
    pending.resolve(alice);
  });
  expect(callback).not.toHaveBeenCalled();
});

it('recovers after an error through refresh', async () => {
  fetchUser.mockRejectedValueOnce(new ApiError('network')).mockResolvedValueOnce(alice);
  const { result } = await renderHook(() => useUserProfile(1));
  await waitFor(() => expect(result.current.profileState.status).toBe('error'));
  await act(async () => {
    result.current.handleRefresh();
  });
  await waitFor(() => expect(result.current.profileState.status).toBe('success'));
});

it('delivers only one valid completion in Strict Mode', async () => {
  fetchUser.mockResolvedValue(alice);
  const callback = jest.fn();
  function Wrapper({ children }: PropsWithChildren) {
    return <StrictMode>{children}</StrictMode>;
  }
  const { result } = await renderHook(() => useUserProfile(1, callback), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.profileState.status).toBe('success'));
  expect(callback).toHaveBeenCalledTimes(1);
});
