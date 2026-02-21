import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../lib/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={option}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(index);
            }}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderRadius: radius.md,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md - 2,
  },
  segmentSelected: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelSelected: {
    color: colors.textPrimary,
  },
});
