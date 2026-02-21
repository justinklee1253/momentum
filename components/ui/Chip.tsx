import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../lib/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accentColor?: string;
}

export function Chip({ label, selected = false, onPress, accentColor = colors.accent }: ChipProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        selected && { backgroundColor: `${accentColor}26`, borderColor: accentColor },
      ]}
    >
      <Text style={[styles.label, selected && { color: accentColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
