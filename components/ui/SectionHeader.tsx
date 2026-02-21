import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../lib/theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  rightContent?: ReactNode;
}

export function SectionHeader({ title, action, onAction, actionIcon, rightContent }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rightContent ?? (
        action ? (
          <Pressable onPress={onAction} style={styles.actionBtn}>
            {actionIcon}
            <Text style={styles.action}>{action}</Text>
          </Pressable>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  action: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.indexBlue,
  },
});
