import type { Theme } from './theme.types';

export const spacing = {
  lg: 16,
  md: 12,
  sm: 8,
  xl: 24,
  xs: 4,
  xxl: 32,
} as const;

export const defaultTheme: Theme = {
  accentSurface: '#EAF0FD',
  background: '#F6F7FA',
  border: '#DEE3ED',
  error: '#AC2636',
  muted: '#5E697D',
  onPrimary: '#FFFFFF',
  primary: '#2454C6',
  surface: '#FFFFFF',
  text: '#172137',
};
