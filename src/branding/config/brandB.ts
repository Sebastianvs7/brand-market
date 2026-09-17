import { defaultTheme } from '@/shared/theme';
import type { BrandConfig } from '../brand.types';

export const brandB = {
  api: {
    baseUrl: 'https://fakestoreapi.com',
    pageSize: 8,
    sort: 'desc',
    timeoutMs: 12_000,
  },
  id: 'b',
  name: 'Brand B',
  tagline: 'A different point of view.',
  theme: {
    ...defaultTheme,
    accentSurface: '#F1EAF8',
    background: '#F9F6FC',
    border: '#E7DEEF',
    muted: '#6F617B',
    primary: '#713AB0',
    text: '#2B2038',
  },
} as const satisfies BrandConfig;
