import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../hooks/useUserId';

const MAX_CHARS = 300;
const MIN_CHARS = 10;
const MAGENTA = '#D946EF';

export default function IdentityScreen() {
  const userId = useUserId();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('onboarding_profiles')
      .select('identity_statement')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.identity_statement) setValue(data.identity_statement);
      });
  }, [userId]);

  async function handleSave() {
    if (!userId || value.trim().length < MIN_CHARS) return;
    setSaving(true);
    const { error } = await supabase
      .from('onboarding_profiles')
      .upsert(
        { user_id: userId, identity_statement: value.trim() },
        { onConflict: 'user_id' }
      );
    setSaving(false);
    if (error) {
      Alert.alert('Failed to save', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  }

  function handlePressIn() {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }

  function handlePressOut() {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  const charsLeft = MAX_CHARS - value.length;
  const isValid = value.trim().length >= MIN_CHARS;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Settings</Text>
        </Pressable>
        <Text style={styles.screenTitle}>IDENTITY STATEMENT</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.description}>
            Your identity statement defines who you are and what drives your execution. It shapes how Momentum coaches you.
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(text) => {
                if (text.length <= MAX_CHARS) setValue(text);
              }}
              placeholder="I am someone who..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text style={[styles.charCount, charsLeft < 20 && styles.charCountWarn]}>
              {charsLeft} characters remaining
            </Text>
          </View>

          {value.trim().length > 0 && value.trim().length < MIN_CHARS && (
            <Text style={styles.validationHint}>
              Minimum {MIN_CHARS} characters required.
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Animated.View style={[styles.saveBtnWrap, { transform: [{ scale: scaleAnim }] }]}>
            <Animated.View style={[styles.btnGlow, { opacity: glowAnim }]} />
            <Pressable
              onPress={handleSave}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!isValid || saving}
            >
              <View style={styles.saveBtn}>
                {saving ? (
                  <ActivityIndicator size="small" color={MAGENTA} />
                ) : (
                  <View style={styles.saveBtnInner}>
                    <View style={[styles.saveBtnIcon, !isValid && styles.saveBtnIconDisabled]}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke={isValid ? MAGENTA : colors.textMuted}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
                      SAVE STATEMENT
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
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
  inputWrapper: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 160,
    lineHeight: 24,
  },
  charCount: {
    ...typography.micro,
    color: colors.textMuted,
    textAlign: 'right',
  },
  charCountWarn: {
    color: '#EAB308',
  },
  validationHint: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },

  // Deploy-style save button
  saveBtnWrap: {
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
    shadowColor: MAGENTA,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.input,
  },
  saveBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnIconDisabled: {
    borderColor: colors.border,
  },
  saveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.5,
    color: MAGENTA,
  },
  saveBtnTextDisabled: {
    color: colors.textMuted,
  },
});
