import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type UserProfileViewStyles = {
  container: ViewStyle;
  detail: TextStyle;
  title: TextStyle;
};

export const createStyles = (theme: Theme): UserProfileViewStyles =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      gap: 16,
      padding: 24,
    },
    detail: {
      color: theme.text,
      fontSize: 16,
      lineHeight: 24,
    },
    title: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '700',
    },
  });
