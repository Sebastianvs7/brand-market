import { useCallback, useMemo, type ReactElement } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/shared/theme';
import type { BrandId } from '../../brand.types';
import { brands } from '../../config/brandRegistry';
import { useBrand } from '../../hooks/useBrand';
import { createStyles } from './BrandSwitcher.styles';

export const BrandSwitcher = (): ReactElement => {
  const { brand, onBrandChange } = useBrand();

  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSelectBrand = useCallback(
    (id: BrandId): void => {
      onBrandChange(id);
    },
    [onBrandChange],
  );

  return (
    <View
      accessibilityLabel="Choose a brand"
      accessibilityRole="radiogroup"
      style={styles.container}
    >
      {brands.map((option) => {
        const isSelected = option.id === brand.id;

        return (
          <Pressable
            key={option.id}
            accessibilityLabel={option.name}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            style={[styles.option, isSelected && styles.selected]}
            onPress={() => handleSelectBrand(option.id)}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{option.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
