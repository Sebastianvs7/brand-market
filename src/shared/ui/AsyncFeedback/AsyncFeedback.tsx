import { memo, useMemo, type ReactElement, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ActionButton } from '../ActionButton';
import { createStyles } from './AsyncFeedback.styles';

export type AsyncFeedbackProps = Readonly<{
  loader?: ReactNode;
  message?: string;
  title: string;
  onRetry?: () => void;
}>;

export const AsyncFeedback = memo(
  ({ loader, message, title, onRetry }: AsyncFeedbackProps): ReactElement => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const hasLoader = loader !== null && loader !== undefined;

    return (
      <View accessibilityLiveRegion="polite" style={styles.container}>
        {hasLoader && loader}

        <Text selectable style={styles.title}>
          {title}
        </Text>

        {message && (
          <Text selectable style={styles.message}>
            {message}
          </Text>
        )}

        {onRetry && <ActionButton isDisabled={hasLoader} label="Retry" onPress={onRetry} />}
      </View>
    );
  },
);

AsyncFeedback.displayName = 'AsyncFeedback';
