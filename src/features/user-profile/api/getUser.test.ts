import { fetch } from 'expo/fetch';
import { jsonResponse } from '@/testing/http';
import { getUser } from './getUser';

const mockFetch = jest.mocked(fetch);
beforeEach(() => mockFetch.mockReset());
it.each([0, -1, 1.5, NaN])('rejects invalid user ID %s before fetching', async (id) => {
  await expect(getUser(id, new AbortController().signal)).rejects.toMatchObject({
    kind: 'invalid-input',
  });
  expect(mockFetch).not.toHaveBeenCalled();
});
it('validates user fields and response identity', async () => {
  mockFetch.mockResolvedValue(
    jsonResponse({ id: 2, firstName: 'Bob', lastName: 'Example', email: 'bob@example.com' }),
  );
  await expect(getUser(1, new AbortController().signal)).rejects.toMatchObject({
    kind: 'invalid-response',
  });
});
it('fetches the requested user with a typed validated result', async () => {
  const user = { id: 1, firstName: 'Alice', lastName: 'Example', email: 'alice@example.com' };
  mockFetch.mockResolvedValue(jsonResponse(user));
  await expect(getUser(1, new AbortController().signal)).resolves.toEqual(user);
  expect(mockFetch.mock.calls[0]?.[0]).toBe('https://dummyjson.com/users/1');
});
