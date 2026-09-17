import { useMemo, type ReactElement } from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './ActionButton.styles';

export type ActionButtonProps = Readonly<{
  isDisabled?: boolean;
  label: string;
  onPress: () => void;
}>;

export const ActionButton = ({
  isDisabled = false,
  label,
  onPress,
}: ActionButtonProps): ReactElement => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};
