import { createContext } from 'react';
import type { BrandConfig, BrandId } from '../brand.types';

export type BrandContextValue = Readonly<{
  brand: BrandConfig;
  onBrandChange: (id: BrandId) => void;
}>;

export const BrandContext = createContext<BrandContextValue | null>(null);
