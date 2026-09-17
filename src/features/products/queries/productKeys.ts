import type { ProductsSource } from '../types';

export const productKeys = {
  list: ({ baseUrl, pageSize, scope, sort, timeoutMs }: ProductsSource) =>
    ['products', scope, { baseUrl, pageSize, sort, timeoutMs }] as const,
};
