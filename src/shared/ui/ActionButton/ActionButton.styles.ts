import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type ActionButtonStyles = {
  button: ViewStyle;
  disabled: ViewStyle;
  label: TextStyle;
  pressed: ViewStyle;
};

export const createStyles = (theme: Theme): ActionButtonStyles =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 14,
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    disabled: { opacity: 0.5 },
    label: { color: theme.onPrimary, fontSize: 15, fontWeight: '600' },
    pressed: { opacity: 0.8 },
  });
