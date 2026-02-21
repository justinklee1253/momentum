import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, fontWeights } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { useOnboardingStore } from '../../stores/onboardingStore';

export default function IdentityScreen() {
  const { identityStatement, setIdentityStatement } = useOnboardingStore();
  const [localValue, setLocalValue] = useState(identityStatement);

  function handleContinue() {
    setIdentityStatement(localValue.trim());
    router.push('/(onboarding)/ideal-day');
  }

  const canContinue = localValue.trim().length >= 10;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.progressRow}>
            <OnboardingProgress current={1} total={5} />
          </View>

          <View style={styles.header}>
            <Text style={styles.step}>STEP 1 OF 5</Text>
            <Text style={styles.title}>Who are you becoming?</Text>
            <Text style={styles.description}>
              This statement is the north star for every AI output in the system. Complete the sentence below.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>I am someone who</Text>
            <TextInput
              value={localValue}
              onChangeText={setLocalValue}
              placeholder="executes with precision, shows up regardless of circumstance, and builds at a level most won't."
              multiline
              style={styles.input}
              maxLength={300}
              showCharCount
            />
          </View>

          <View style={styles.examples}>
            <Text style={styles.examplesLabel}>EXAMPLES</Text>
            {[
              'operates at elite level across all domains of life',
              'builds systems, not excuses, and executes daily without exception',
              'prioritizes long-term excellence over short-term comfort',
            ].map((ex) => (
              <Text key={ex} style={styles.example}>— {ex}</Text>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="CONTINUE"
            onPress={handleContinue}
            disabled={!canContinue}
          />
          <Pressable onPress={() => router.push('/(onboarding)/ideal-day')} style={styles.skipBtn}>
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
  inputWrapper: {
    marginBottom: spacing.xl,
  },
  prefix: {
    ...typography.body,
    color: colors.accent,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 120,
  },
  examples: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  examplesLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  example: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
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
