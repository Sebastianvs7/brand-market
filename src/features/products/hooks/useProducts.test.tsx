import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ApiError } from '@/shared/api/apiError';
import { deferred } from '@/testing/deferred';
import { createQueryWrapper } from '@/testing/queryWrapper';
import { getProductsPage } from '../api/getProductsPage';
import { makeProducts, source } from '../testing/fixtures';
import type { ProductPage } from '../types';
import { useProducts } from './useProducts';

jest.mock('../api/getProductsPage');
const getPage = jest.mocked(getProductsPage);
const products = makeProducts(5);
beforeEach(() => {
  getPage.mockReset();
  getPage.mockImplementation(async (config, offset) => ({
    items: products.slice(offset, offset + config.pageSize),
    nextOffset: offset + config.pageSize < products.length ? offset + config.pageSize : null,
  }));
});

it('loads pages once, keeps stable existing products and stops at the end', async () => {
  const { Wrapper } = createQueryWrapper();
  const { result } = await renderHook(() => useProducts(source), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.products).toHaveLength(2));
  const firstProduct = result.current.products[0];
  await act(async () => {
    result.current.handleLoadMore();
    result.current.handleLoadMore();
  });
  await waitFor(() => expect(result.current.products).toHaveLength(4));
  expect(getPage).toHaveBeenCalledTimes(2);
  expect(result.current.products[0]).toBe(firstProduct);
  await act(async () => {
    result.current.handleLoadMore();
  });
  await waitFor(() => expect(result.current.products).toHaveLength(5));
  expect(result.current.hasNextPage).toBe(false);
  await act(async () => {
    result.current.handleLoadMore();
  });
  expect(getPage).toHaveBeenCalledTimes(3);
});

it('keeps existing products on load-more failure and retries only explicitly', async () => {
  const { Wrapper } = createQueryWrapper();
  const { result } = await renderHook(() => useProducts(source), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.products).toHaveLength(2));
  getPage.mockRejectedValueOnce(new ApiError('network'));
  await act(async () => {
    result.current.handleLoadMore();
  });
  await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true));
  expect(result.current.products).toHaveLength(2);
  await act(async () => {
    result.current.handleLoadMore();
  });
  expect(getPage).toHaveBeenCalledTimes(2);
  await act(async () => {
    result.current.handleRetryMore();
  });
  await waitFor(() => expect(result.current.products).toHaveLength(4));
});

it('keeps the list and clears the refresh indicator when refresh fails', async () => {
  const { Wrapper } = createQueryWrapper();
  const { result } = await renderHook(() => useProducts(source), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.products).toHaveLength(2));
  getPage.mockRejectedValueOnce(new ApiError('http', 500));
  await act(async () => {
    await result.current.handleRefresh();
  });
  expect(result.current.products).toHaveLength(2);
  expect(result.current.isRefreshing).toBe(false);
  expect(result.current.error).toMatchObject({ status: 500 });
});

it('cancels load-more before refresh and ignores its late result', async () => {
  const { Wrapper } = createQueryWrapper();
  const { result } = await renderHook(() => useProducts(source), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.products).toHaveLength(2));
  const pending = deferred<ProductPage>();
  getPage.mockImplementationOnce(() => pending.promise);
  await act(async () => {
    result.current.handleLoadMore();
  });
  const moreSignal = getPage.mock.calls[1]?.[2];
  await act(async () => {
    await result.current.handleRefresh();
  });
  expect(moreSignal?.aborted).toBe(true);
  await act(async () => {
    pending.resolve({ items: products.slice(2), nextOffset: null });
  });
  expect(result.current.products.map((item) => item.id)).toEqual([1, 2]);
});

it('isolates brands, cancels unused requests and cannot show a late A result as B', async () => {
  const pending = deferred<ProductPage>();
  getPage.mockImplementationOnce(() => pending.promise);
  const { Wrapper } = createQueryWrapper();
  const { result, rerender } = await renderHook(
    (scope: string) => useProducts({ ...source, scope }),
    {
      wrapper: Wrapper,
      initialProps: 'a',
    },
  );
  const signalA = getPage.mock.calls[0]?.[2];
  await rerender('b');
  await waitFor(() => expect(result.current.products).toHaveLength(2));
  expect(signalA?.aborted).toBe(true);
  await act(async () => {
    pending.resolve({ items: [{ ...products[0]!, title: 'Stale A' }], nextOffset: null });
  });
  expect(result.current.products[0]?.title).toBe('Product 1');
  expect(getPage.mock.calls[1]?.[0].scope).toBe('b');
});

it('aborts a pending request on unmount', async () => {
  getPage.mockReturnValue(deferred<ProductPage>().promise);
  const { Wrapper } = createQueryWrapper();
  const { unmount } = await renderHook(() => useProducts(source), { wrapper: Wrapper });
  const signal = getPage.mock.calls[0]?.[2];
  await unmount();
  expect(signal?.aborted).toBe(true);
});
