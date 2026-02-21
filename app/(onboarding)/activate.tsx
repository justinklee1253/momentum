import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { COACHING_STYLE_LABELS, COACHING_TONE_SETTINGS, DEFAULT_PROTOCOLS, AnchorType } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';

export default function ActivateScreen() {
  const store = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const selectedProtocols = DEFAULT_PROTOCOLS.filter((p) =>
    store.selectedProtocolIds.includes(p.title)
  );

  async function handleActivate() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // 1. Upsert onboarding profile
      const { error: onboardingError } = await supabase
        .from('onboarding_profiles')
        .upsert({
          user_id: user.id,
          identity_statement: store.identityStatement,
          ideal_day: store.idealDay,
          goals_week: store.goalsWeek,
        });
      if (onboardingError) throw onboardingError;

      // 2. Upsert AI personality profile
      const toneSettings = COACHING_TONE_SETTINGS[store.coachingStyle];
      const { error: personalityError } = await supabase
        .from('ai_personality_profiles')
        .upsert({
          user_id: user.id,
          coaching_style: store.coachingStyle,
          tone_settings: toneSettings,
        });
      if (personalityError) throw personalityError;

      // 3. Insert selected protocols (recurring daily by default)
      if (selectedProtocols.length > 0) {
        const { error: habitsError } = await supabase
          .from('habits')
          .insert(
            selectedProtocols.map((p) => ({
              user_id: user.id,
              title: p.title,
              type: p.type,
              category: p.category,
              anchor_type: p.anchor_type,
              schedule: { frequency: 'daily' },
            }))
          );
        if (habitsError) throw habitsError;
      }

      // 4. Mark onboarding complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      if (profileError) throw profileError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      store.reset();
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Activation failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progressRow}>
          <OnboardingProgress current={5} total={5} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>STEP 5 OF 5</Text>
          <Text style={styles.title}>System ready.</Text>
          <Text style={styles.description}>
            Review your configuration before activating. Everything can be changed later in settings.
          </Text>
        </View>

        <View style={styles.summary}>
          <SummaryRow label="IDENTITY" value={store.identityStatement || '—'} />
          <SummaryRow label="IDEAL DAY" value={store.idealDay || '—'} />
          <SummaryRow
            label="OPERATING MODE"
            value={COACHING_STYLE_LABELS[store.coachingStyle]}
            valueColor={colors.accent}
          />
          <SummaryRow
            label="PROTOCOLS"
            value={`${selectedProtocols.length} selected`}
          />
        </View>

        {selectedProtocols.length > 0 && (
          <View style={styles.protocolList}>
            <Text style={styles.protocolListLabel}>SELECTED PROTOCOLS</Text>
            {selectedProtocols.map((p) => (
              <View key={p.title} style={styles.protocolItem}>
                <View style={[
                  styles.tierDot,
                  {
                    backgroundColor: p.anchor_type === AnchorType.NON_NEGOTIABLE
                      ? colors.tierNonNeg
                      : p.anchor_type === AnchorType.GROWTH
                      ? colors.tierGrowth
                      : colors.tierRotating,
                  },
                ]} />
                <Text style={styles.protocolTitle}>{p.title}</Text>
              </View>
            ))}
          </View>
        )}

        {store.goalsWeek.length > 0 && (
          <View style={styles.goalsList}>
            <Text style={styles.protocolListLabel}>CURRENT FOCUS</Text>
            {store.goalsWeek.map((g) => (
              <Text key={g.text} style={styles.goalItem}>— {g.text}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="ACTIVATE SYSTEM" onPress={handleActivate} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={[summaryStyles.value, valueColor && { color: valueColor }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  label: {
    ...typography.micro,
    color: colors.textMuted,
    width: 110,
    paddingTop: 2,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});

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
  summary: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  protocolList: {
    marginBottom: spacing.lg,
  },
  protocolListLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  protocolTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  goalsList: {
    marginBottom: spacing.lg,
  },
  goalItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
