import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type ProductsScreenStyles = {
  content: ViewStyle;
  empty: ViewStyle;
  header: ViewStyle;
  heading: TextStyle;
  intro: ViewStyle;
  list: ViewStyle;
  screen: ViewStyle;
  separator: ViewStyle;
  tagline: TextStyle;
  wordmark: TextStyle;
};

export const createStyles = (theme: Theme): ProductsScreenStyles =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
    },
    header: {
      alignSelf: 'center',
      gap: 16,
      maxWidth: 760,
      paddingBottom: 18,
      paddingHorizontal: 24,
      paddingTop: 14,
      width: '100%',
    },
    heading: {
      color: theme.text,
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: -1,
      lineHeight: 41,
    },
    intro: {
      gap: 5,
    },
    list: {
      alignSelf: 'center',
      flex: 1,
      maxWidth: 760,
      width: '100%',
    },
    screen: {
      backgroundColor: theme.background,
      flex: 1,
    },
    separator: {
      height: 12,
    },
    tagline: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
    },
    wordmark: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 3,
    },
  });
