import { Image } from 'expo-image';
import { memo, useMemo, useState, type ReactElement } from 'react';
import { Text, View } from 'react-native';
import { formatPrice } from '@/shared/format/formatPrice';
import { useTheme } from '@/shared/theme';
import type { Product } from '../../schemas/product.schema';
import { createStyles } from './ProductCard.styles';

export type ProductCardProps = Readonly<{
  product: Product;
}>;

export const ProductCard = memo(({ product }: ProductCardProps): ReactElement => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [failedImage, setFailedImage] = useState<string | null>(null);
  const handleImageError = (): void => {
    setFailedImage(product.image);
  };

  return (
    <View style={styles.card} testID={'product-' + product.id}>
      <View style={styles.imageFrame}>
        {failedImage === product.image ? (
          <Text style={styles.fallback}>Image unavailable</Text>
        ) : (
          <Image
            accessibilityLabel={product.title}
            accessibilityRole="image"
            cachePolicy="memory-disk"
            contentFit="contain"
            recyclingKey={product.image}
            source={product.image}
            style={styles.image}
            onError={handleImageError}
          />
        )}
      </View>

      <View style={styles.details}>
        {product.category && <Text style={styles.category}>{product.category}</Text>}
        <Text selectable style={styles.title}>
          {product.title}
        </Text>
        <Text selectable style={styles.price}>
          {formatPrice(product.price)}
        </Text>
      </View>
    </View>
  );
});

ProductCard.displayName = 'ProductCard';
