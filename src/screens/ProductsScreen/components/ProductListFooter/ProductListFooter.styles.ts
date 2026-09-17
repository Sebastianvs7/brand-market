import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type ProductListFooterStyles = {
  container: ViewStyle;
  label: TextStyle;
};

export const createStyles = (theme: Theme): ProductListFooterStyles =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 6,
      paddingVertical: 24,
    },
    label: {
      color: theme.muted,
      fontSize: 13,
      textAlign: 'center',
    },
  });
