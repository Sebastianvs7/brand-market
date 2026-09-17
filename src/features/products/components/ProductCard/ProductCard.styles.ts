import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type ProductCardStyles = {
  card: ViewStyle;
  category: TextStyle;
  details: ViewStyle;
  fallback: TextStyle;
  image: ImageStyle;
  imageFrame: ViewStyle;
  price: TextStyle;
  title: TextStyle;
};

export const createStyles = (theme: Theme): ProductCardStyles =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 18,
      minHeight: 150,
      padding: 16,
    },
    category: {
      color: theme.muted,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    details: { flex: 1, gap: 8, justifyContent: 'center' },
    fallback: { color: theme.muted, fontSize: 12, textAlign: 'center' },
    image: { height: 110, width: 88 },
    imageFrame: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      height: 110,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 88,
    },
    price: {
      color: theme.primary,
      fontSize: 20,
      fontVariant: ['tabular-nums'],
      fontWeight: '700',
      lineHeight: 26,
    },
    title: { color: theme.text, fontSize: 16, fontWeight: '500', lineHeight: 23 },
  });
