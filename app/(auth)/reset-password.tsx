import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors, spacing, radius, fontWeights } from '../../lib/theme';
import { useAuth } from '../../hooks/useAuth';
import { createSessionFromUrl } from '../../lib/supabase';

function LightningIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.17} viewBox="0 0 12 14" fill="none">
      <Path d="M6.5 1L1.5 8H6L5.5 13L10.5 6H6L6.5 1Z" fill="#fff" stroke="#fff" strokeWidth={0.5} strokeLinejoin="round" />
    </Svg>
  );
}

function LockIcon({ size = 14, color = '#a1a1aa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function EyeIcon({ size = 16, color = '#a1a1aa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function EyeOffIcon({ size = 16, color = '#a1a1aa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 3.97 7.65 6.06 6.06" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.39 13.14 21.66 14.21 20.83 15.17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14.12 14.12C13.56 14.68 12.80 15 12 15C10.34 15 9 13.66 9 12C9 11.2 9.32 10.44 9.88 9.88" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ArrowLeftIcon({ size = 10, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /\d/.test(pw) },
  { label: 'One special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
] as const;

export default function ResetPasswordScreen() {
  const { session, updatePassword } = useAuth();
  const url = Linking.useURL();
  const [initialUrlHandled, setInitialUrlHandled] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const ruleResults = PASSWORD_RULES.map((rule) => rule.test(password));
  const allRulesPassed = ruleResults.every(Boolean);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = allRulesPassed && passwordsMatch && !loading;

  // Create session from deep link URL (cold start or app opened from email link)
  useEffect(() => {
    if (initialUrlHandled) return;

    const run = async () => {
      const initialUrl = await Linking.getInitialURL();
      const urlToUse = url ?? initialUrl;
      if (!urlToUse || !urlToUse.includes('access_token')) {
        setInitialUrlHandled(true);
        setHasRecoverySession(!!session);
        return;
      }
      const { error } = await createSessionFromUrl(urlToUse);
      setInitialUrlHandled(true);
      if (error) {
        setHasRecoverySession(false);
        return;
      }
      setHasRecoverySession(true);
    };

    run();
  }, [url, initialUrlHandled, session]);

  // If we already have a session (e.g. from previous handle) and just landed on this screen
  useEffect(() => {
    if (initialUrlHandled && session && !hasRecoverySession) {
      setHasRecoverySession(true);
    }
  }, [initialUrlHandled, session, hasRecoverySession]);

  async function handleSetPassword() {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Update failed', error.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Password updated',
          'You can sign in with your new password.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
        );
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Update failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Still resolving initial URL / session
  if (!initialUrlHandled) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.indexBlue} />
        <Text style={styles.loadingText}>Verifying link...</Text>
      </View>
    );
  }

  // No valid recovery session — link expired or opened directly
  if (!hasRecoverySession) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <LinearGradient
              colors={['#3B82F6', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBg}
            >
              <LightningIcon />
            </LinearGradient>
            <View>
              <Text style={styles.logoTitle}>MOMENTUM</Text>
              <Text style={styles.logoSubtitle}>EXECUTION SYSTEM</Text>
            </View>
          </View>
          <View style={styles.mainContent}>
            <Text style={styles.heroTitle}>Invalid or expired link</Text>
            <Text style={styles.heroSubtitle}>
              This password reset link is invalid or has expired. Request a new link below.
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(auth)/forgot-password');
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonLabel}>Request new reset link</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(auth)/login');
              }}
              style={styles.backLink}
            >
              <ArrowLeftIcon />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Has recovery session — show new password form
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <LinearGradient
              colors={['#3B82F6', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBg}
            >
              <LightningIcon />
            </LinearGradient>
            <View>
              <Text style={styles.logoTitle}>MOMENTUM</Text>
              <Text style={styles.logoSubtitle}>EXECUTION SYSTEM</Text>
            </View>
          </View>

          <View style={styles.mainContent}>
            <Text style={styles.heroTitle}>Set new password</Text>
            <Text style={styles.heroSubtitle}>
              Enter and confirm your new password below.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <LockIcon />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.inputIconRight}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPassword(!showPassword);
                  }}
                  hitSlop={8}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <LockIcon />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.inputIconRight}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  hitSlop={8}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </Pressable>
              </View>
            </View>

            {PASSWORD_RULES.map((rule, i) => (
              <View key={rule.label} style={styles.requirementRow}>
                <View
                  style={[
                    styles.requirementDot,
                    { backgroundColor: ruleResults[i] ? colors.accent : colors.border },
                  ]}
                />
                <Text style={[styles.requirementText, { color: ruleResults[i] ? colors.textSecondary : colors.textMuted }]}>
                  {rule.label}
                </Text>
              </View>
            ))}

            <Pressable
              onPress={handleSetPassword}
              disabled={!canSubmit}
              style={[styles.resetButton, !canSubmit && { opacity: 0.4 }]}
            >
              <Text style={styles.resetButtonLabel}>
                {loading ? 'Updating...' : 'Set new password'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(auth)/login');
              }}
              style={styles.backLink}
            >
              <ArrowLeftIcon />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f11',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
  },
  logoBg: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: fontWeights.bold,
    color: '#ededed',
    letterSpacing: 0.4,
  },
  logoSubtitle: {
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 0.45,
  },

  mainContent: {
    paddingHorizontal: spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: fontWeights.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 42,
  },
  inputIconLeft: {
    width: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconRight: {
    width: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
    paddingRight: spacing.sm,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  requirementText: {
    fontSize: 12,
  },

  resetButton: {
    backgroundColor: colors.indexBlue,
    borderRadius: 8,
    marginTop: spacing.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonLabel: {
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    color: '#fff',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: fontWeights.semibold,
    color: colors.indexBlue,
  },
});
