import type { Theme } from '@/shared/theme';

export type BrandId = 'a' | 'b';

export type BrandConfig = Readonly<{
  api: Readonly<{
    baseUrl: string;
    pageSize: number;
    sort: 'asc' | 'desc';
    timeoutMs: number;
  }>;
  id: BrandId;
  name: string;
  tagline: string;
  theme: Theme;
}>;
