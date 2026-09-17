import { use } from 'react';
import type { Theme } from './theme.types';
import { ThemeContext } from './ThemeProvider';

export const useTheme = (): Theme => use(ThemeContext);
