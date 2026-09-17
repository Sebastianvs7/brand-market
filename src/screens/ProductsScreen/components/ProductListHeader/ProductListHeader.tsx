import { memo, useMemo, type ReactElement } from 'react';
import { Text, View } from 'react-native';
import { getErrorMessage } from '@/shared/api/apiError';
import { useTheme } from '@/shared/theme';
import { AsyncFeedback } from '@/shared/ui/AsyncFeedback';
import { createStyles } from './ProductListHeader.styles';

export type ProductListHeaderProps = Readonly<{
  count: number;
  error: Error | null;
  onRetry: () => void;
}>;

export const ProductListHeader = memo(
  ({ count, error, onRetry }: ProductListHeaderProps): ReactElement => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
      <View>
        <View style={styles.collection}>
          <Text style={styles.eyebrow}>THE COLLECTION</Text>
          <Text style={styles.count}>{count} loaded</Text>
        </View>

        {error && (
          <AsyncFeedback
            message={getErrorMessage(error)}
            title="Could not refresh"
            onRetry={onRetry}
          />
        )}
      </View>
    );
  },
);

ProductListHeader.displayName = 'ProductListHeader';
