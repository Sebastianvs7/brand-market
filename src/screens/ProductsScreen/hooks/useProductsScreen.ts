import type { BrandConfig } from '@/branding';
import { useBrand } from '@/branding';
import { useProducts, type UseProductsResult } from '@/features/products';

export type UseProductsScreenResult = Readonly<{
  brand: BrandConfig;
}> &
  UseProductsResult;

export const useProductsScreen = (): UseProductsScreenResult => {
  const { brand } = useBrand();

  const products = useProducts({
    baseUrl: brand.api.baseUrl,
    pageSize: brand.api.pageSize,
    scope: brand.id,
    sort: brand.api.sort,
    timeoutMs: brand.api.timeoutMs,
  });

  return { brand, ...products };
};
