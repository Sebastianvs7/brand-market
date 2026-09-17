import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProductsPage } from '../api/getProductsPage';
import { productKeys } from '../queries/productKeys';
import type { Product } from '../schemas/product.schema';
import type { ProductsSource } from '../types';

export type UseProductsResult = Readonly<{
  error: Error | null;
  hasNextPage: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefreshing: boolean;
  products: Product[];
  handleLoadMore: () => void;
  handleRefresh: () => Promise<void>;
  handleRetry: () => void;
  handleRetryMore: () => void;
}>;

type ProductsQueryKey = ReturnType<typeof productKeys.list>;

export const useProducts = (source: ProductsSource): UseProductsResult => {
  const { baseUrl, pageSize, scope, sort, timeoutMs } = source;
  const stableSource = useMemo(
    () => ({ baseUrl, pageSize, scope, sort, timeoutMs }),
    [baseUrl, pageSize, scope, sort, timeoutMs],
  );
  const queryKey = useMemo(() => productKeys.list(stableSource), [stableSource]);

  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getProductsPage(stableSource, pageParam, signal),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const [refreshingKey, setRefreshingKey] = useState<ProductsQueryKey | null>(null);
  const action = useRef<{ key: ProductsQueryKey; kind: 'refresh' | 'more' } | null>(null);
  const activeKey = useRef(queryKey);

  useEffect(() => {
    activeKey.current = queryKey;
  }, [queryKey]);

  const products = useMemo(() => {
    const seen = new Set<number>();

    return (query.data?.pages.flatMap((page) => page.items) ?? []).filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);

      return true;
    });
  }, [query.data]);

  const { refetch, fetchNextPage, hasNextPage, isFetching, isFetchNextPageError } = query;

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (action.current?.key === queryKey && action.current.kind === 'refresh') return;
    const operation = { key: queryKey, kind: 'refresh' } as const;
    action.current = operation;
    setRefreshingKey(queryKey);
    try {
      await queryClient.cancelQueries({ queryKey, exact: true });
      // A source change between the cancel and the refetch must not refetch for,
      // nor clear the refresh indicator of, the key that is active now.
      if (activeKey.current !== queryKey) return;
      await refetch({ cancelRefetch: false });
    } finally {
      if (action.current === operation) action.current = null;
      if (activeKey.current === queryKey) setRefreshingKey(null);
    }
  }, [queryClient, queryKey, refetch]);

  const loadMore = useCallback(
    async (isRetry: boolean): Promise<void> => {
      if (
        !hasNextPage ||
        isFetching ||
        (isFetchNextPageError && !isRetry) ||
        action.current?.key === queryKey ||
        queryClient.isFetching({ queryKey, exact: true }) > 0
      ) {
        return;
      }
      const operation = { key: queryKey, kind: 'more' } as const;
      action.current = operation;
      try {
        await fetchNextPage({ cancelRefetch: false });
      } finally {
        if (action.current === operation) action.current = null;
      }
    },
    [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError, queryClient, queryKey],
  );

  const handleLoadMore = useCallback((): void => {
    void loadMore(false);
  }, [loadMore]);

  const handleRetryMore = useCallback((): void => {
    void loadMore(true);
  }, [loadMore]);

  const handleRetry = useCallback((): void => {
    void handleRefresh();
  }, [handleRefresh]);

  return {
    error: query.error,
    hasNextPage: Boolean(hasNextPage),
    isFetchNextPageError: query.isFetchNextPageError,
    isFetchingNextPage: query.isFetchingNextPage,
    isPending: query.isPending,
    isRefreshing: refreshingKey === queryKey,
    products,
    handleLoadMore,
    handleRefresh,
    handleRetry,
    handleRetryMore,
  };
};
