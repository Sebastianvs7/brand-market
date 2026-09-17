import { memo, useMemo, type ReactElement } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { getErrorMessage } from '@/shared/api/apiError';
import { useTheme } from '@/shared/theme';
import { AsyncFeedback } from '@/shared/ui/AsyncFeedback';
import { createStyles } from './ProductListFooter.styles';

export type ProductListFooterProps = Readonly<{
  error: Error | null;
  hasMore: boolean;
  isLoading: boolean;
  onRetry: () => void;
}>;

export const ProductListFooter = memo(
  ({ error, hasMore, isLoading, onRetry }: ProductListFooterProps): ReactElement => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    if (isLoading) {
      return (
        <AsyncFeedback
          loader={
            <ActivityIndicator accessibilityLabel="Loading more products" color={theme.primary} />
          }
          title="Loading more products"
        />
      );
    }

    if (error) {
      return (
        <AsyncFeedback
          message={getErrorMessage(error)}
          title="Could not load more"
          onRetry={onRetry}
        />
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {hasMore ? 'More good things below' : 'You have seen the whole collection'}
        </Text>
      </View>
    );
  },
);

ProductListFooter.displayName = 'ProductListFooter';
