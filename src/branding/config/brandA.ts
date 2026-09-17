import { defaultTheme } from '@/shared/theme';
import type { BrandConfig } from '../brand.types';

export const brandA = {
  api: {
    baseUrl: 'https://fakestoreapi.com',
    pageSize: 6,
    sort: 'asc',
    timeoutMs: 10_000,
  },
  id: 'a',
  name: 'Brand A',
  tagline: 'Good things. Everyday.',
  theme: defaultTheme,
} as const satisfies BrandConfig;
