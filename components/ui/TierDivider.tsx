import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../lib/theme';
import { AnchorType, TIER_LABELS } from '../../lib/constants';

const TIER_COLORS: Record<AnchorType, string> = {
  [AnchorType.NON_NEGOTIABLE]: colors.tierNonNeg,
  [AnchorType.GROWTH]: colors.indexBlue,
  [AnchorType.ROTATING_FOCUS]: colors.tierRotating,
};

export function TierDivider({ tier }: { tier: AnchorType }) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: TIER_COLORS[tier] }]} />
      <Text style={styles.label}>{TIER_LABELS[tier]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
});
