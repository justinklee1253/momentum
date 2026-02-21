import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { useAuth } from '../../hooks/useAuth';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

function SettingRow({ label, value, onPress, disabled = false, destructive = false }: SettingRowProps) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled && onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.rowPressed]}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive, disabled && styles.rowLabelDisabled]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {!disabled && <Text style={styles.rowChevron}>›</Text>}
        {disabled && <Text style={styles.rowComingSoon}>SOON</Text>}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← STATUS</Text>
        </Pressable>
        <Text style={styles.screenTitle}>SYSTEM SETTINGS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OPERATION</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Operating Mode"
              onPress={() => router.push('/settings/mode' as any)}
            />
            <View style={styles.separator} />
            <SettingRow
              label="Add Protocol"
              onPress={() => router.push('/settings/add-protocol' as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.sectionContent}>
            <SettingRow label="Profile" disabled />
            <View style={styles.separator} />
            <SettingRow label="Privacy" disabled />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SYSTEM</Text>
          <View style={styles.sectionContent}>
            <SettingRow label="Notifications" disabled />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Sign Out"
              destructive
              onPress={async () => {
                await signOut();
              }}
            />
          </View>
        </View>

        <Text style={styles.version}>MOMENTUM v1.0.0</Text>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backText: {
    ...typography.micro,
    color: colors.accent,
    letterSpacing: 1,
  },
  screenTitle: {
    ...typography.micro,
    color: colors.textMuted,
    letterSpacing: 2,
    fontSize: 11,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  rowPressed: {
    backgroundColor: colors.input,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowLabelDestructive: {
    color: colors.tierNonNeg,
  },
  rowLabelDisabled: {
    color: colors.textMuted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowChevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  rowComingSoon: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 9,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  version: {
    ...typography.micro,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
