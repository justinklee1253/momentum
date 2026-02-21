import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors, spacing, radius, fontWeights } from '../../lib/theme';
import { useAuth } from '../../hooks/useAuth';

function LightningIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.17} viewBox="0 0 12 14" fill="none">
      <Path d="M6.5 1L1.5 8H6L5.5 13L10.5 6H6L6.5 1Z" fill="#fff" stroke="#fff" strokeWidth={0.5} strokeLinejoin="round" />
    </Svg>
  );
}

function MailIcon({ size = 14, color = '#a1a1aa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M2 7L12 13L22 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowRightIcon({ size = 12, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ size = 8, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /\d/.test(pw) },
  { label: 'One special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
] as const;

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((rule) => rule.test(password)),
    [password],
  );
  const passedCount = ruleResults.filter(Boolean).length;
  const allRulesPassed = passedCount === PASSWORD_RULES.length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const validEmail = EMAIL_RE.test(email.trim());

  const canSubmit =
    validEmail &&
    allRulesPassed &&
    passwordsMatch &&
    agreedToTerms &&
    !loading;

  function strengthBarColor(index: number) {
    if (password.length === 0) return colors.border;
    if (index < passedCount) {
      if (passedCount === PASSWORD_RULES.length) return '#10B981';
      if (passedCount >= 2) return '#F59E0B';
      return '#EF4444';
    }
    return colors.border;
  }

  async function handleSignup() {
    if (!canSubmit) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { error, needsConfirmation } = await signUp(email.trim(), password);

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Account creation failed', error.message);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (needsConfirmation) {
        Alert.alert(
          'Verify your email',
          'Check your inbox to confirm your account before signing in.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
        );
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Account creation failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
          {/* Header */}
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

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Welcome Header */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Create Account</Text>
              <Text style={styles.welcomeSubtitle}>
                Begin your momentum journey today
              </Text>
            </View>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <MailIcon />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <LockIcon />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
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

              {/* Strength Bars */}
              <View style={styles.strengthBars}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[styles.strengthBar, { backgroundColor: strengthBarColor(i) }]}
                  />
                ))}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirements}>
                {PASSWORD_RULES.map((rule, i) => {
                  const passed = ruleResults[i];
                  return (
                    <View key={rule.label} style={styles.requirementRow}>
                      <View
                        style={[
                          styles.requirementDot,
                          passed && styles.requirementDotPassed,
                        ]}
                      >
                        {passed && <CheckIcon size={5} />}
                      </View>
                      <Text
                        style={[
                          styles.requirementText,
                          passed && styles.requirementTextPassed,
                        ]}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Confirm Password Field */}
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
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
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

            {/* Terms Checkbox */}
            <Pressable
              style={styles.termsRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAgreedToTerms(!agreedToTerms);
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                ]}
              >
                {agreedToTerms && <CheckIcon size={8} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Pressable>

            {/* Create Account Button */}
            <Pressable
              onPress={handleSignup}
              disabled={!canSubmit}
              style={[
                styles.createButton,
                !canSubmit && { opacity: 0.4 },
              ]}
            >
              <View style={styles.createButtonInner}>
                <Text style={styles.createButtonLabel}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Text>
                {!loading && <ArrowRightIcon />}
              </View>
            </Pressable>

            {/* Sign In Link */}
            <View style={styles.signInRow}>
              <View style={styles.signInDivider} />
              <View style={styles.signInContent}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.replace('/(auth)/login');
                  }}
                >
                  <Text style={styles.signInLink}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <Pressable>
                <Text style={styles.footerLinkText}>Privacy</Text>
              </Pressable>
              <View style={styles.footerDot} />
              <Pressable>
                <Text style={styles.footerLinkText}>Terms</Text>
              </Pressable>
              <View style={styles.footerDot} />
              <Pressable>
                <Text style={styles.footerLinkText}>Help</Text>
              </Pressable>
            </View>
            <Text style={styles.footerVersion}>
              {'\u00A9'} 2024 MOMENTUM {'\u2022'} v1.0.0
            </Text>
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

  // Header
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

  // Main Content
  mainContent: {
    paddingHorizontal: spacing.md,
    flex: 1,
    justifyContent: 'center',
  },

  // Welcome
  welcomeSection: {
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: fontWeights.bold,
    color: '#fff',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Fields
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
    alignSelf: 'stretch',
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

  // Strength Bars
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  strengthBar: {
    flex: 1,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },

  // Requirements
  requirements: {
    marginTop: 6,
    gap: 2,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementDotPassed: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  requirementText: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  requirementTextPassed: {
    color: '#10B981',
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.indexBlue,
    borderColor: colors.indexBlue,
  },
  termsText: {
    flex: 1,
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 16.25,
  },
  termsLink: {
    fontWeight: fontWeights.medium,
    color: colors.indexBlue,
  },

  // Create Account Button
  createButton: {
    backgroundColor: colors.indexBlue,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  createButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  createButtonLabel: {
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    color: '#fff',
  },

  // Sign In
  signInRow: {
    marginTop: spacing.lg,
  },
  signInDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 17,
  },
  signInContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  signInLink: {
    fontSize: 12,
    fontWeight: fontWeights.semibold,
    color: colors.indexBlue,
    textAlign: 'center',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 17,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerLinkText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  footerDot: {
    width: 2,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.textSecondary,
  },
  footerVersion: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
