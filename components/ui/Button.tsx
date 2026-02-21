import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, fontWeights } from '../../lib/theme';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  size?: 'sm' | 'md';
}

export function Button({ label, variant = 'primary', loading = false, size = 'md', onPress, disabled, style, ...props }: ButtonProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style as any,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000' : colors.accent}
        />
      ) : (
        <Text style={[
          styles.label,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelGhost,
          size === 'sm' && styles.labelSm,
        ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: '#000',
    fontWeight: fontWeights.semibold,
    fontSize: 15,
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
  labelGhost: {
    color: colors.accent,
  },
  labelSm: {
    fontSize: 13,
  },
});
