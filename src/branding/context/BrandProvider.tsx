import { useCallback, useMemo, useState, type PropsWithChildren, type ReactElement } from 'react';
import type { BrandId } from '../brand.types';
import { brandRegistry } from '../config/brandRegistry';
import { BrandContext } from './BrandContext';

export const BrandProvider = ({ children }: PropsWithChildren): ReactElement => {
  const [brandId, setBrandId] = useState<BrandId>('a');

  const onBrandChange = useCallback((id: BrandId): void => {
    setBrandId(id);
  }, []);

  const value = useMemo(
    () => ({ brand: brandRegistry[brandId], onBrandChange }),
    [brandId, onBrandChange],
  );

  return <BrandContext value={value}>{children}</BrandContext>;
};
