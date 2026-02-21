import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, radius, fontWeights } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressRow}>
          <OnboardingProgress current={0} total={5} />
        </View>

        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.title}>MOMENTUM</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.headline}>
            This is not a habit app.
          </Text>
          <Text style={styles.description}>
            Momentum is a personal execution system. It holds you to the standard of who you are becoming — not who you wish you were.
          </Text>

          <View style={styles.pillars}>
            {[
              { label: 'PROTOCOLS', desc: 'Tiered commitments that define your daily standard' },
              { label: 'MOMENTUM INDEX', desc: 'A live metric of your execution trajectory' },
              { label: 'SIGNAL LOG', desc: 'Operational debrief — not a diary' },
              { label: 'SYSTEM', desc: 'Mission control intelligence grounded in your data' },
            ].map((item) => (
              <View key={item.label} style={styles.pillar}>
                <Text style={styles.pillarLabel}>{item.label}</Text>
                <Text style={styles.pillarDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="INITIALIZE SYSTEM"
            onPress={() => router.push('/(onboarding)/identity')}
          />
          <Pressable onPress={() => router.push('/(onboarding)/identity')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  progressRow: {
    marginBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: fontWeights.bold,
    color: '#fff',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    letterSpacing: 6,
  },
  body: {
    flex: 1,
  },
  headline: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  pillars: {
    gap: spacing.md,
  },
  pillar: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  pillarLabel: {
    ...typography.micro,
    color: colors.accent,
    width: 110,
    paddingTop: 2,
  },
  pillarDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    paddingTop: spacing.lg,
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
