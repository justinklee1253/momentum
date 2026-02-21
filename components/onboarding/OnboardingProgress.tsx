import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../lib/theme';

interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current && styles.dotActive,
            i === current && styles.dotCurrent,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accentMuted,
    width: 8,
    height: 8,
  },
  dotCurrent: {
    backgroundColor: colors.accent,
    width: 8,
    height: 8,
  },
});
