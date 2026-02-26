import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, fontWeights } from '../../lib/theme';
import {
  CoachingStyle,
  COACHING_STYLE_LABELS,
  COACHING_STYLE_DESCRIPTIONS,
  COACHING_TONE_PREVIEWS,
  COACHING_TONE_SETTINGS,
} from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../hooks/useUserId';

const STYLE_COLORS: Record<CoachingStyle, string> = {
  [CoachingStyle.DIRECT]: colors.direct,
  [CoachingStyle.STRATEGIC]: colors.strategic,
  [CoachingStyle.DRIVEN]: colors.driven,
};

export default function ModeScreen() {
  const userId = useUserId();
  const [selected, setSelected] = useState<CoachingStyle>(CoachingStyle.DIRECT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('ai_personality_profiles')
      .select('coaching_style')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.coaching_style) {
          setSelected(data.coaching_style as CoachingStyle);
        }
      });
  }, [userId]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from('ai_personality_profiles')
      .update({
        coaching_style: selected,
        tone_settings: COACHING_TONE_SETTINGS[selected],
      })
      .eq('user_id', userId);
    setSaving(false);

    if (error) {
      Alert.alert('Failed to update mode', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Settings</Text>
        </Pressable>
        <Text style={styles.screenTitle}>OPERATING MODE</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Controls the tone and approach of all AI interactions — briefings, chat, and signal prompts.
        </Text>

        <View style={styles.cards}>
          {[CoachingStyle.DIRECT, CoachingStyle.STRATEGIC, CoachingStyle.DRIVEN].map((style) => {
            const isSelected = selected === style;
            const color = STYLE_COLORS[style];
            return (
              <Pressable
                key={style}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected(style);
                }}
                style={[styles.card, isSelected && { borderColor: color, backgroundColor: `${color}10` }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.styleDot, { backgroundColor: color }]} />
                  <Text style={[styles.styleLabel, isSelected && { color }]}>
                    {COACHING_STYLE_LABELS[style]}
                  </Text>
                  {isSelected && (
                    <View style={[styles.activeBadge, { backgroundColor: `${color}22`, borderColor: color }]}>
                      <Text style={[styles.activeBadgeText, { color }]}>ACTIVE</Text>
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
        <Pressable
          onPress={saving ? undefined : handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: `${STYLE_COLORS[selected]}14`,
              borderColor: `${STYLE_COLORS[selected]}4D`,
            },
            pressed && { opacity: 0.75 },
            saving && { opacity: 0.5 },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={STYLE_COLORS[selected]} />
          ) : (
            <Text style={[styles.saveBtnText, { color: STYLE_COLORS[selected] }]}>SAVE MODE</Text>
          )}
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
  backBtn: { padding: spacing.xs },
  backText: { ...typography.micro, color: colors.accent, letterSpacing: 1 },
  screenTitle: { ...typography.micro, color: colors.textMuted, letterSpacing: 2, fontSize: 11 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  cards: { gap: spacing.md },
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
  styleDot: { width: 8, height: 8, borderRadius: 4 },
  styleLabel: { ...typography.subhead, color: colors.textPrimary, flex: 1 },
  activeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  activeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  styleDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 22 },
  preview: {
    backgroundColor: colors.input,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  previewLabel: { ...typography.micro, color: colors.textMuted, marginBottom: spacing.xs },
  previewText: { ...typography.caption, color: colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  saveBtn: {
    borderRadius: radius.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  saveBtnText: {
    ...typography.micro,
    fontFamily: 'Inter_600SemiBold',
  },
});
