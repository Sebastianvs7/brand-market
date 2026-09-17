import { createContext, type PropsWithChildren, type ReactElement } from 'react';
import type { Theme } from './theme.types';
import { defaultTheme } from './tokens';

export const ThemeContext = createContext<Theme>(defaultTheme);

export type ThemeProviderProps = PropsWithChildren<{
  theme: Theme;
}>;

export const ThemeProvider = ({ children, theme }: ThemeProviderProps): ReactElement => (
  <ThemeContext value={theme}>{children}</ThemeContext>
);
