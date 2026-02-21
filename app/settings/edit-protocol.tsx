import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { TextInput } from '../../components/ui/TextInput';
import { RecurrenceSelector } from '../../components/settings/RecurrenceSelector';
import { useProtocols } from '../../hooks/useProtocols';
import { useUserId } from '../../hooks/useUserId';
import { AnchorType, HabitType, ProtocolIntent, PROTOCOL_INTENT_LABELS, PROTOCOL_UNITS, TIER_LABELS, type ProtocolUnit } from '../../lib/constants';
import { parseSchedule, type Schedule } from '../../lib/schedule';
import { supabase } from '../../lib/supabase';

const ANCHOR_OPTIONS = [AnchorType.NON_NEGOTIABLE, AnchorType.GROWTH, AnchorType.ROTATING_FOCUS];
const TYPE_OPTIONS = [HabitType.GENERIC, HabitType.JOURNAL, HabitType.WORKOUT];
const INTENT_OPTIONS = [ProtocolIntent.BUILD, ProtocolIntent.QUIT];

const TIER_COLORS: Record<AnchorType, string> = {
  [AnchorType.NON_NEGOTIABLE]: colors.tierNonNeg,
  [AnchorType.GROWTH]: colors.tierGrowth,
  [AnchorType.ROTATING_FOCUS]: colors.tierRotating,
};

export default function EditProtocolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useUserId();
  const { updateProtocol, isUpdating } = useProtocols(userId);

  const [title, setTitle] = useState('');
  const [intent, setIntent] = useState<ProtocolIntent>(ProtocolIntent.BUILD);
  const [anchor, setAnchor] = useState<AnchorType>(AnchorType.NON_NEGOTIABLE);
  const [type, setType] = useState<HabitType>(HabitType.GENERIC);
  const [schedule, setSchedule] = useState<Schedule>({ frequency: 'daily' });
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState<ProtocolUnit>('count');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedTargetValue = Number.parseInt(targetValue, 10);
  const hasValidTarget = Number.isInteger(parsedTargetValue) && parsedTargetValue > 0;
  const canSave = title.trim().length >= 2 && hasValidTarget && !!id;
  const targetSummary = `${hasValidTarget ? parsedTargetValue : 0} ${targetUnit.toUpperCase()} / DAY`;

  useEffect(() => {
    if (!id || !userId) return;
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }
      if (data) {
        setTitle(data.title);
        setIntent((data.intent as ProtocolIntent) ?? ProtocolIntent.BUILD);
        setTargetValue(String(data.target_value ?? 1));
        setTargetUnit((data.target_unit as ProtocolUnit) ?? 'count');
        setAnchor(data.anchor_type as AnchorType);
        setType(data.type as HabitType);
        setSchedule(parseSchedule(data.schedule));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, userId]);

  async function handleSave() {
    if (!canSave || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateProtocol({
        habitId: id,
        updates: {
          title: title.trim(),
          intent,
          target_value: parsedTargetValue,
          target_unit: targetUnit,
          anchor_type: anchor,
          type,
          schedule,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Alert.alert('Failed to update protocol', err.message);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.screenTitle}>EDIT PROTOCOL</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error || 'Missing protocol id.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Cancel</Text>
        </Pressable>
        <Text style={styles.screenTitle}>EDIT PROTOCOL</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TextInput
          label="PROTOCOL NAME"
          value={title}
          onChangeText={setTitle}
          placeholder="Protocol name"
          maxLength={60}
          showCharCount
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>PROTOCOL INTENT</Text>
          <View style={styles.intentOptions}>
            {INTENT_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIntent(option);
                }}
                style={[
                  styles.intentOption,
                  intent === option && styles.intentOptionSelected,
                ]}
              >
                <Text style={[styles.intentText, intent === option && styles.intentTextSelected]}>
                  {PROTOCOL_INTENT_LABELS[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>TARGET</Text>
          <View style={styles.targetCard}>
            <View style={styles.targetTopRow}>
              <Text style={styles.targetLabel}>VALUE</Text>
              <View style={styles.targetInputWrap}>
                <RNTextInput
                  value={targetValue}
                  onChangeText={(text) => setTargetValue(text.replace(/[^0-9]/g, ''))}
                  onBlur={() => {
                    if (!targetValue) setTargetValue('1');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.targetInput}
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.unitGrid}>
              {PROTOCOL_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTargetUnit(unit);
                  }}
                  style={[styles.unitChip, targetUnit === unit && styles.unitChipSelected]}
                >
                  <Text style={[styles.unitChipText, targetUnit === unit && styles.unitChipTextSelected]}>
                    {unit.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Text style={styles.targetSummary}>{targetSummary}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>ANCHOR TYPE (TIER)</Text>
          <View style={styles.options}>
            {ANCHOR_OPTIONS.map((a) => (
              <Pressable
                key={a}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAnchor(a);
                }}
                style={[
                  styles.option,
                  anchor === a && { borderColor: TIER_COLORS[a], backgroundColor: `${TIER_COLORS[a]}18` },
                ]}
              >
                <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[a] }]} />
                <Text style={[styles.optionText, anchor === a && { color: TIER_COLORS[a] }]}>
                  {TIER_LABELS[a]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>EXECUTION TYPE</Text>
          <View style={styles.typeOptions}>
            {TYPE_OPTIONS.map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setType(t);
                }}
                style={[
                  styles.typeOption,
                  type === t && { borderColor: colors.accent, backgroundColor: colors.accentDim },
                ]}
              >
                <Text style={[styles.typeText, type === t && { color: colors.accent }]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <RecurrenceSelector value={schedule} onChange={setSchedule} />

        <View style={styles.saveRow}>
          <Pressable
            onPress={handleSave}
            disabled={!canSave || isUpdating}
            style={[styles.saveBtn, (!canSave || isUpdating) && styles.saveBtnDisabled]}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
            )}
          </Pressable>
        </View>
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
  backBtn: { padding: spacing.xs },
  backText: { ...typography.micro, color: colors.accent, letterSpacing: 1 },
  screenTitle: { ...typography.micro, color: colors.textMuted, letterSpacing: 2, fontSize: 11 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  field: {},
  fieldLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeOptions: { flexDirection: 'row', gap: spacing.sm },
  intentOptions: { flexDirection: 'row', gap: spacing.sm },
  intentOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  intentOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  intentText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  intentTextSelected: {
    color: colors.accent,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  typeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  targetCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  targetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  targetInputWrap: {
    minWidth: 84,
  },
  targetInput: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...typography.subhead,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  unitChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    minWidth: 72,
    alignItems: 'center',
  },
  unitChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  unitChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  unitChipTextSelected: {
    color: colors.accent,
  },
  targetSummary: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveRow: { marginTop: spacing.md },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
});
