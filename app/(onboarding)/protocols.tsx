import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { TierDivider } from '../../components/ui/TierDivider';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { DEFAULT_PROTOCOLS, AnchorType, HabitType, TIER_LABELS } from '../../lib/constants';

const PROTOCOL_TYPE_ICONS: Record<HabitType, string> = {
  [HabitType.GENERIC]: '◆',
  [HabitType.JOURNAL]: '≡',
  [HabitType.WORKOUT]: '◉',
};

export default function ProtocolsScreen() {
  const { setSelectedProtocolIds } = useOnboardingStore();
  // All protocols selected by default
  const [selected, setSelected] = useState<Set<number>>(
    new Set(DEFAULT_PROTOCOLS.map((_, i) => i))
  );

  function toggleProtocol(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleContinue() {
    // Convert selected indices to string IDs (we'll use the title as temp ID during onboarding)
    const ids = Array.from(selected).map((i) => DEFAULT_PROTOCOLS[i].title);
    setSelectedProtocolIds(ids);
    router.push('/(onboarding)/tone');
  }

  const byTier = {
    [AnchorType.NON_NEGOTIABLE]: DEFAULT_PROTOCOLS
      .map((p, i) => ({ ...p, index: i }))
      .filter((p) => p.anchor_type === AnchorType.NON_NEGOTIABLE),
    [AnchorType.GROWTH]: DEFAULT_PROTOCOLS
      .map((p, i) => ({ ...p, index: i }))
      .filter((p) => p.anchor_type === AnchorType.GROWTH),
    [AnchorType.ROTATING_FOCUS]: DEFAULT_PROTOCOLS
      .map((p, i) => ({ ...p, index: i }))
      .filter((p) => p.anchor_type === AnchorType.ROTATING_FOCUS),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progressRow}>
          <OnboardingProgress current={3} total={5} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>STEP 3 OF 5</Text>
          <Text style={styles.title}>Select your protocols.</Text>
          <Text style={styles.description}>
            These are your daily commitments. NON-NEGOTIABLES are core to your Momentum Index. Select what you'll actually execute.
          </Text>
        </View>

        {([AnchorType.NON_NEGOTIABLE, AnchorType.GROWTH, AnchorType.ROTATING_FOCUS] as AnchorType[]).map((tier) => (
          <View key={tier}>
            <TierDivider tier={tier} />
            {byTier[tier].map((protocol) => {
              const isSelected = selected.has(protocol.index);
              return (
                <Pressable
                  key={protocol.index}
                  onPress={() => toggleProtocol(protocol.index)}
                  style={[styles.protocolRow, isSelected && styles.protocolRowSelected]}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.protocolInfo}>
                    <Text style={[styles.protocolTitle, !isSelected && styles.protocolTitleOff]}>
                      {protocol.title}
                    </Text>
                    <Text style={styles.protocolMeta}>
                      {PROTOCOL_TYPE_ICONS[protocol.type]} {protocol.type}
                      {protocol.category ? ` · ${protocol.category}` : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}

        <Text style={styles.note}>
          You can add or modify protocols after activation.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`CONTINUE WITH ${selected.size} PROTOCOL${selected.size !== 1 ? 'S' : ''}`}
          onPress={handleContinue}
          disabled={selected.size === 0}
        />
        <Pressable onPress={() => router.push('/(onboarding)/tone')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressRow: {
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  step: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  protocolRowSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.borderActive,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  protocolInfo: {
    flex: 1,
  },
  protocolTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  protocolTitleOff: {
    color: colors.textMuted,
  },
  protocolMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
