import type { Product } from '../schemas/product.schema';
import type { ProductsSource } from '../types';

export const source: ProductsSource = {
  baseUrl: 'https://fakestoreapi.com',
  pageSize: 2,
  scope: 'a',
  sort: 'asc',
  timeoutMs: 10_000,
};

export const makeProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, index) => ({
    category: 'essentials',
    id: index + 1,
    image: 'https://fakestoreapi.com/img/test.png',
    price: 10 + index,
    title: 'Product ' + (index + 1),
  }));
