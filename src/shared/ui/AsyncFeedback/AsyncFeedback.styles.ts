import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type AsyncFeedbackStyles = {
  container: ViewStyle;
  message: TextStyle;
  title: TextStyle;
};

export const createStyles = (theme: Theme): AsyncFeedbackStyles =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 12,
      padding: 24,
    },
    message: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
