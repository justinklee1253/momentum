import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert, ActivityIndicator, Animated, Easing, TextInput as RNTextInput } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { TextInput } from '../../components/ui/TextInput';
import { RecurrenceSelector } from '../../components/settings/RecurrenceSelector';
import { useProtocols } from '../../hooks/useProtocols';
import { useUserId } from '../../hooks/useUserId';
import { AnchorType, HabitType, ProtocolIntent, PROTOCOL_INTENT_LABELS, PROTOCOL_UNITS, TIER_LABELS, type ProtocolUnit } from '../../lib/constants';
import { DAILY_SCHEDULE, type Schedule } from '../../lib/schedule';

const ANCHOR_OPTIONS = [AnchorType.NON_NEGOTIABLE, AnchorType.GROWTH, AnchorType.ROTATING_FOCUS];
const TYPE_OPTIONS = [HabitType.GENERIC, HabitType.JOURNAL, HabitType.WORKOUT];
const INTENT_OPTIONS = [ProtocolIntent.BUILD, ProtocolIntent.QUIT];

const TIER_COLORS: Record<AnchorType, string> = {
  [AnchorType.NON_NEGOTIABLE]: colors.tierNonNeg,
  [AnchorType.GROWTH]: colors.tierGrowth,
  [AnchorType.ROTATING_FOCUS]: colors.tierRotating,
};

export default function AddProtocolScreen() {
  const userId = useUserId();
  const { createProtocol, isCreating } = useProtocols(userId);

  const [title, setTitle] = useState('');
  const [intent, setIntent] = useState<ProtocolIntent>(ProtocolIntent.BUILD);
  const [anchor, setAnchor] = useState<AnchorType>(AnchorType.NON_NEGOTIABLE);
  const [type, setType] = useState<HabitType>(HabitType.GENERIC);
  const [schedule, setSchedule] = useState<Schedule>(DAILY_SCHEDULE);
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState<ProtocolUnit>('count');

  const parsedTargetValue = Number.parseInt(targetValue, 10);
  const hasValidTarget = Number.isInteger(parsedTargetValue) && parsedTargetValue > 0;
  const canSave = title.trim().length >= 2 && hasValidTarget;
  const targetSummary = `${hasValidTarget ? parsedTargetValue : 0} ${targetUnit.toUpperCase()} / DAY`;

  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const activateAnim = useRef(new Animated.Value(0)).current;
  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (canSave) {
      Animated.timing(activateAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
      );
      glowLoopRef.current = loop;
      loop.start();
    } else {
      glowLoopRef.current?.stop();
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.timing(activateAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
    }
  }, [canSave]);

  const btnOpacity = activateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const borderColor = activateAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(16,185,129,0)', 'rgba(16,185,129,0.6)'] });

  function handlePressIn() {
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.timing(scaleAnim, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }

  async function handleSave() {
    if (!canSave) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createProtocol({
        title: title.trim(),
        intent,
        target_value: parsedTargetValue,
        target_unit: targetUnit,
        anchor_type: anchor,
        type,
        schedule,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Alert.alert('Failed to add protocol', err.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Cancel</Text>
        </Pressable>
        <Text style={styles.screenTitle}>ADD PROTOCOL</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TextInput
          label="PROTOCOL NAME"
          value={title}
          onChangeText={setTitle}
          placeholder="Cold shower, Deep work, Morning reading..."
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
          <Text style={styles.typeNote}>
            GENERIC = check-off · JOURNAL = opens Signal Log · WORKOUT = opens workout log
          </Text>
        </View>

        <RecurrenceSelector value={schedule} onChange={setSchedule} />

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>PREVIEW</Text>
          <View style={styles.previewRow}>
            <View style={[styles.previewDot, { backgroundColor: TIER_COLORS[anchor] }]} />
            <Text style={styles.previewTitle}>{title || 'Protocol name'}</Text>
          </View>
          <Text style={styles.previewMeta}>{TIER_LABELS[anchor]} · {type} · {intent} · {targetSummary}</Text>
        </View>

        <Animated.View style={[styles.deployBtnWrap, { transform: [{ scale: scaleAnim }], opacity: btnOpacity }]}>
          <Animated.View style={[styles.btnGlow, { opacity: glowAnim }]} />
          <Pressable
            onPress={handleSave}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!canSave || isCreating}
          >
            <Animated.View style={[styles.addBtn, { borderColor }]}>
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <View style={styles.addBtnInner}>
                  <View style={styles.addBtnIcon}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 5v14M5 12h14" stroke={canSave ? colors.accent : colors.textMuted} strokeWidth={2.5} strokeLinecap="round" />
                    </Svg>
                  </View>
                  <Text style={[styles.addBtnText, !canSave && styles.addBtnTextDisabled]}>
                    DEPLOY PROTOCOL
                  </Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
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
  field: {},
  fieldLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.sm,
  },
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
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  intentOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
  typeNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
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
  preview: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  previewMeta: {
    ...typography.caption,
    color: colors.textMuted,
    paddingLeft: spacing.md + 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  deployBtnWrap: {
    position: 'relative',
    marginTop: spacing.sm,
  },
  btnGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: radius.md + 1,
    backgroundColor: 'transparent',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 0,
    backgroundColor: colors.input,
  },
  addBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.accent,
  },
  addBtnTextDisabled: {
    color: colors.textMuted,
  },
});
