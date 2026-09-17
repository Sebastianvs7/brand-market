import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren, type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandProvider, useBrand } from '@/branding';
import { createQueryClient } from '@/shared/query/createQueryClient';
import { ThemeProvider } from '@/shared/theme';

const BrandTheme = ({ children }: PropsWithChildren): ReactElement => {
  const { brand } = useBrand();

  return <ThemeProvider theme={brand.theme}>{children}</ThemeProvider>;
};

export const AppProviders = ({ children }: PropsWithChildren): ReactElement => {
  const [queryClient] = useState(createQueryClient);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <BrandProvider>
          <BrandTheme>{children}</BrandTheme>
        </BrandProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};
