import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const indicatorColor = variant === 'primary' ? '#FFFFFF' : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}` as const],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style
      ]}
    >
      {() => (
        <>
          {leftIcon}
          <Text style={[styles.label, styles[`label_${variant}` as const]]}>{title}</Text>
          {loading ? <ActivityIndicator size="small" color={indicatorColor} /> : rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary
  },
  size_md: {
    minHeight: 44
  },
  size_lg: {
    minHeight: 56
  },
  label: {
    fontWeight: '600',
    fontSize: 16
  },
  label_primary: {
    color: '#FFFFFF'
  },
  label_secondary: {
    color: colors.text
  },
  label_outline: {
    color: colors.primary
  },
  pressed: {
    opacity: 0.92
  },
  disabled: {
    opacity: 0.6
  }
});
