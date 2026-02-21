import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { format } from 'date-fns';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { TextInput } from '../../components/ui/TextInput';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../hooks/useUserId';
import { useQueryClient } from '@tanstack/react-query';

export default function WorkoutLogScreen() {
  const { habitId } = useLocalSearchParams<{ habitId?: string }>();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isEditing = !!existingId;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingId(data.id);
        setNotes(data.notes ?? '');
      }
      setLoading(false);
    })();
  }, [userId, today]);

  async function handleLog() {
    if (!userId) return;
    setSaving(true);

    try {
      if (existingId) {
        await supabase
          .from('workouts')
          .update({ notes: notes.trim() || null })
          .eq('id', existingId);
      } else {
        const { data } = await supabase
          .from('workouts')
          .insert({ user_id: userId, date: today, notes: notes.trim() || null })
          .select('id')
          .single();

        if (data) setExistingId(data.id);
      }

      if (habitId) {
        await supabase
          .from('habit_logs')
          .upsert(
            { habit_id: habitId, user_id: userId, date: today, status: 'DONE' },
            { onConflict: 'habit_id,date' }
          );
      } else {
        const { data: workoutHabits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'WORKOUT')
          .eq('active', true);

        if (workoutHabits && workoutHabits.length > 0) {
          await Promise.all(
            workoutHabits.map((h) =>
              supabase
                .from('habit_logs')
                .upsert(
                  { habit_id: h.id, user_id: userId, date: today, status: 'DONE' },
                  { onConflict: 'habit_id,date' }
                )
            )
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ['protocols', userId] });
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', userId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Alert.alert('Failed to save workout', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardWrap}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>{isEditing ? 'EDIT WORKOUT' : 'LOG WORKOUT'}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.indexBlue} />
            </View>
          ) : (
            <>
              <View style={styles.stub}>
                <Text style={styles.stubIcon}>◉</Text>
                <Text style={styles.stubTitle}>WORKOUT EXECUTION</Text>
                <Text style={styles.stubText}>
                  {isEditing
                    ? 'Modify your session notes below. Your execution status is preserved.'
                    : 'Full workout logging with exercise tracking is coming in the next update. Log your session now to mark execution.'}
                </Text>
              </View>

              <TextInput
                label="SESSION NOTES (OPTIONAL)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any notes about today's session..."
                multiline
                style={styles.notesInput}
                maxLength={300}
              />

              <View style={styles.deployBtnWrap}>
                <Pressable
                  onPress={handleLog}
                  disabled={saving}
                  style={({ pressed }) => pressed && styles.deployBtnPressed}
                >
                  <View style={styles.deployBtn}>
                    {saving ? (
                      <ActivityIndicator size="small" color={colors.indexBlue} />
                    ) : (
                      <View style={styles.deployBtnInner}>
                        <View style={styles.deployBtnIcon}>
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                            <Path d="M12 5v14M5 12h14" stroke={colors.indexBlue} strokeWidth={2.5} strokeLinecap="round" />
                          </Svg>
                        </View>
                        <Text style={styles.deployBtnText}>{isEditing ? 'UPDATE WORKOUT' : 'LOG WORKOUT'}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: colors.base,
  },
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: { padding: spacing.xs },
  cancelText: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.micro, color: colors.textPrimary, letterSpacing: 2 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  stub: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  stubIcon: {
    fontSize: 40,
    color: colors.indexBlue,
    marginBottom: spacing.md,
  },
  stubTitle: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  stubText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  notesInput: {
    minHeight: 80,
  },
  deployBtnWrap: {
    position: 'relative',
    marginTop: spacing.sm,
  },
  deployBtnPressed: {
    opacity: 0.85,
  },
  deployBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 0,
    backgroundColor: colors.input,
  },
  deployBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deployBtnIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deployBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.indexBlue,
  },
});
