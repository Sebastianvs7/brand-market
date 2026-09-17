import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { Fragment, type PropsWithChildren, type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandProvider, useBrand } from '@/branding';
import { ThemeProvider } from '@/shared/theme';
import { createQueryWrapper } from './queryWrapper';

const BrandTheme = ({ children }: PropsWithChildren): ReactElement => {
  const { brand } = useBrand();

  return (
    <ThemeProvider theme={brand.theme}>
      <Fragment key={brand.id}>{children}</Fragment>
    </ThemeProvider>
  );
};

export const renderWithProviders = (ui: ReactElement) => {
  const { client } = createQueryWrapper();
  const Wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <BrandProvider>
          <BrandTheme>{children}</BrandTheme>
        </BrandProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );

  return render(ui, { wrapper: Wrapper });
};
