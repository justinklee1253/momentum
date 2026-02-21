import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { useOnboardingStore } from '../../stores/onboardingStore';

export default function IdealDayScreen() {
  const { idealDay, setIdealDay, goalsWeek, setGoalsWeek } = useOnboardingStore();
  const [localIdealDay, setLocalIdealDay] = useState(idealDay);
  const [goal1, setGoal1] = useState(goalsWeek[0]?.text ?? '');
  const [goal2, setGoal2] = useState(goalsWeek[1]?.text ?? '');

  function handleContinue() {
    setIdealDay(localIdealDay.trim());
    const goals = [
      goal1.trim() && { text: goal1.trim(), priority: 1 },
      goal2.trim() && { text: goal2.trim(), priority: 2 },
    ].filter(Boolean) as { text: string; priority: number }[];
    setGoalsWeek(goals);
    router.push('/(onboarding)/protocols');
  }

  const canContinue = localIdealDay.trim().length >= 20;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.progressRow}>
            <OnboardingProgress current={2} total={5} />
          </View>

          <View style={styles.header}>
            <Text style={styles.step}>STEP 2 OF 5</Text>
            <Text style={styles.title}>Define your ideal day.</Text>
            <Text style={styles.description}>
              If you executed perfectly, what would a day look like? This grounds the AI in your actual operating standard.
            </Text>
          </View>

          <TextInput
            label="IDEAL DAY"
            value={localIdealDay}
            onChangeText={setLocalIdealDay}
            placeholder="Wake at 5:30. Deep work block 6–9. Training by 7pm. No reactive scrolling before noon. In bed by 10:30."
            multiline
            style={styles.textarea}
            maxLength={500}
            showCharCount
          />

          <View style={styles.goalsSection}>
            <Text style={styles.goalsLabel}>CURRENT FOCUS</Text>
            <Text style={styles.goalsDescription}>
              What are 1–2 things you're driving toward right now? Keep it operational.
            </Text>

            <TextInput
              value={goal1}
              onChangeText={setGoal1}
              placeholder="Ship MVP by end of month"
              style={styles.goalInput}
            />
            <View style={{ height: spacing.sm }} />
            <TextInput
              value={goal2}
              onChangeText={setGoal2}
              placeholder="Get to 185 lbs (optional)"
              style={styles.goalInput}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="CONTINUE"
            onPress={handleContinue}
            disabled={!canContinue}
          />
          <Pressable onPress={() => router.push('/(onboarding)/protocols')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  safe: {
    flex: 1,
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
  textarea: {
    minHeight: 120,
    marginBottom: spacing.xl,
  },
  goalsSection: {
    gap: spacing.sm,
  },
  goalsLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  goalsDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  goalInput: {},
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
