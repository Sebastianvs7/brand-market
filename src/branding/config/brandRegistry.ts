import type { BrandConfig, BrandId } from '../brand.types';
import { brandA } from './brandA';
import { brandB } from './brandB';

export const brandRegistry = { a: brandA, b: brandB } satisfies Record<BrandId, BrandConfig>;
export const brands: readonly BrandConfig[] = Object.values(brandRegistry);
