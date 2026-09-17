import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/theme';

export type BrandSwitcherStyles = {
  container: ViewStyle;
  label: TextStyle;
  option: ViewStyle;
  selected: ViewStyle;
  selectedLabel: TextStyle;
};

export const createStyles = (theme: Theme): BrandSwitcherStyles =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.accentSurface,
      borderRadius: 16,
      flexDirection: 'row',
      gap: 4,
      padding: 4,
    },
    label: { color: theme.primary, fontSize: 15, fontWeight: '600' },
    option: {
      alignItems: 'center',
      borderRadius: 12,
      flex: 1,
      justifyContent: 'center',
      minHeight: 48,
      padding: 10,
    },
    selected: { backgroundColor: theme.primary },
    selectedLabel: { color: theme.onPrimary },
  });
