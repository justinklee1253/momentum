import React, { useState } from 'react';
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
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, spacing, radius, fontWeights } from '../../lib/theme';
import { useAuth } from '../../hooks/useAuth';

function LightningIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.17} viewBox="0 0 12 14" fill="none">
      <Path d="M6.5 1L1.5 8H6L5.5 13L10.5 6H6L6.5 1Z" fill="#fff" stroke="#fff" strokeWidth={0.5} strokeLinejoin="round" />
    </Svg>
  );
}

function UnlockedIcon({ size = 22, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7" stroke={color} strokeWidth={2} strokeLinecap="round" />
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

function SendIcon({ size = 12, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validEmail = EMAIL_RE.test(email.trim());

  async function handleReset() {
    if (!validEmail) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Reset failed', error.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSent(true);
        Alert.alert(
          'Check your email',
          'A password reset link has been sent to your inbox.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
        );
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Reset failed', 'An unexpected error occurred. Please try again.');
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
            {/* Icon + Title */}
            <View style={styles.heroSection}>
              <View style={styles.iconCircle}>
                <UnlockedIcon />
              </View>
              <Text style={styles.heroTitle}>Reset Password</Text>
              <Text style={styles.heroSubtitle}>
                Enter your email address to receive a password reset link
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

            {/* Send Reset Link Button */}
            <Pressable
              onPress={handleReset}
              disabled={loading || !validEmail || sent}
              style={[
                styles.resetButton,
                (loading || !validEmail || sent) && { opacity: 0.4 },
              ]}
            >
              <View style={styles.resetButtonInner}>
                <SendIcon />
                <Text style={styles.resetButtonLabel}>
                  {loading ? 'Sending...' : sent ? 'Link Sent' : 'Send Reset Link'}
                </Text>
              </View>
            </Pressable>

            {/* Back to Sign In */}
            <View style={styles.backRow}>
              <View style={styles.backDivider} />
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                style={styles.backLink}
              >
                <ArrowLeftIcon />
                <Text style={styles.backLinkText}>Back to Sign In</Text>
              </Pressable>
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

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  },

  // Fields
  fieldGroup: {
    marginBottom: spacing.lg,
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
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
    paddingRight: spacing.sm,
  },

  // Reset Button
  resetButton: {
    backgroundColor: colors.indexBlue,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  resetButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  resetButtonLabel: {
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    color: '#fff',
  },

  // Back link
  backRow: {
    marginTop: spacing.lg,
  },
  backDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 17,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backLinkText: {
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
    gap: 11,
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
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
