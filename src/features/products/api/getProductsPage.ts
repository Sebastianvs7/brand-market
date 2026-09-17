import { ApiError } from '@/shared/api/apiError';
import { requestJson } from '@/shared/api/requestJson';
import { productsSchema } from '../schemas/product.schema';
import type { ProductPage, ProductsSource } from '../types';

export const getProductsPage = async (
  source: ProductsSource,
  offset: number,
  signal: AbortSignal,
): Promise<ProductPage> => {
  const url = new URL('/products', source.baseUrl);
  const end = offset + source.pageSize;
  url.searchParams.set('limit', String(end + 1));
  url.searchParams.set('sort', source.sort);
  const payload = await requestJson(url.toString(), { signal, timeoutMs: source.timeoutMs });
  const result = productsSchema.safeParse(payload);
  if (!result.success) throw new ApiError('invalid-response', undefined, result.error);

  // The API has no cursor/offset. One look-ahead item determines the end of the catalog.
  return {
    items: result.data.slice(offset, end),
    nextOffset: result.data.length > end ? end : null,
  };
};
