import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type ProductListHeaderStyles = {
  collection: ViewStyle;
  count: TextStyle;
  eyebrow: TextStyle;
};

export const createStyles = (theme: Theme): ProductListHeaderStyles =>
  StyleSheet.create({
    collection: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
      paddingBottom: 16,
      paddingTop: 4,
    },
    count: {
      color: theme.muted,
      fontSize: 12,
      fontVariant: ['tabular-nums'],
    },
    eyebrow: {
      color: theme.muted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.7,
    },
  });
