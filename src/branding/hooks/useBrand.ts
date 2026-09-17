import { use } from 'react';
import type { BrandContextValue } from '../context/BrandContext';
import { BrandContext } from '../context/BrandContext';

export const useBrand = (): BrandContextValue => {
  const context = use(BrandContext);
  if (!context) throw new Error('useBrand must be used within BrandProvider');

  return context;
};
