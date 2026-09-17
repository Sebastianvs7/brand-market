import { StatusBar } from 'expo-status-bar';
import { type ReactElement } from 'react';
import { AppProviders } from '@/app/providers/AppProviders';
import { useBrand } from '@/branding';
import { ProductsScreen } from '@/screens/ProductsScreen';

const BrandApp = (): ReactElement => {
  const { brand } = useBrand();

  return (
    <>
      <StatusBar style="dark" />
      <ProductsScreen key={brand.id} />
    </>
  );
};

const App = (): ReactElement => (
  <AppProviders>
    <BrandApp />
  </AppProviders>
);

export default App;
