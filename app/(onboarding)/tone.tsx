import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { useOnboardingStore } from '../../stores/onboardingStore';
import {
  CoachingStyle,
  COACHING_STYLE_LABELS,
  COACHING_STYLE_DESCRIPTIONS,
  COACHING_TONE_PREVIEWS,
} from '../../lib/constants';

const STYLE_COLORS: Record<CoachingStyle, string> = {
  [CoachingStyle.DIRECT]: colors.direct,
  [CoachingStyle.STRATEGIC]: colors.strategic,
  [CoachingStyle.DRIVEN]: colors.driven,
};

export default function ToneScreen() {
  const { coachingStyle, setCoachingStyle } = useOnboardingStore();
  const [selected, setSelected] = useState<CoachingStyle>(coachingStyle);

  function handleSelect(style: CoachingStyle) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(style);
  }

  function handleContinue() {
    setCoachingStyle(selected);
    router.push('/(onboarding)/activate');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progressRow}>
          <OnboardingProgress current={4} total={5} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>STEP 4 OF 5</Text>
          <Text style={styles.title}>Select your operating mode.</Text>
          <Text style={styles.description}>
            This sets the tone for all AI interactions — briefings, chat, and signal prompts. You can change this anytime in System settings.
          </Text>
        </View>

        <View style={styles.cards}>
          {[CoachingStyle.DIRECT, CoachingStyle.STRATEGIC, CoachingStyle.DRIVEN].map((style) => {
            const isSelected = selected === style;
            const color = STYLE_COLORS[style];
            return (
              <Pressable
                key={style}
                onPress={() => handleSelect(style)}
                style={[
                  styles.card,
                  isSelected && {
                    borderColor: color,
                    backgroundColor: `${color}10`,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.styleDot, { backgroundColor: color }]} />
                  <Text style={[styles.styleLabel, isSelected && { color }]}>
                    {COACHING_STYLE_LABELS[style]}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: `${color}22`, borderColor: color }]}>
                      <Text style={[styles.selectedBadgeText, { color }]}>SELECTED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.styleDesc}>{COACHING_STYLE_DESCRIPTIONS[style]}</Text>

                <View style={styles.preview}>
                  <Text style={styles.previewLabel}>TONE PREVIEW</Text>
                  <Text style={styles.previewText}>{COACHING_TONE_PREVIEWS[style]}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="CONTINUE" onPress={handleContinue} />
        <Pressable onPress={() => router.push('/(onboarding)/activate')} style={styles.skipBtn}>
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
    marginBottom: spacing.xl,
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
  cards: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  styleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  styleLabel: {
    ...typography.subhead,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  styleDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  preview: {
    backgroundColor: colors.input,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  previewLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  previewText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
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
