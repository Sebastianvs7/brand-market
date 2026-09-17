import type { Product } from './schemas/product.schema';

export type ProductPage = Readonly<{
  items: readonly Product[];
  nextOffset: number | null;
}>;

export type ProductsSource = Readonly<{
  baseUrl: string;
  pageSize: number;
  scope: string;
  sort: 'asc' | 'desc';
  timeoutMs: number;
}>;
