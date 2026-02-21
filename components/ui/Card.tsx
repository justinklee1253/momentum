import React from 'react';
import { View, Pressable, StyleSheet, ViewProps, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../lib/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

interface PressableCardProps extends PressableProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style as any]} {...props}>
      {children}
    </View>
  );
}

export function PressableCard({ children, style, onPress, ...props }: PressableCardProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style as any]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
});
