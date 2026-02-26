import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { colors, typography, spacing, radius, fontWeights } from '../../lib/theme';
import { CoachingStyle, COACHING_STYLE_DESCRIPTIONS } from '../../lib/constants';

const STYLE_COLORS: Record<CoachingStyle, string> = {
  [CoachingStyle.DIRECT]: colors.direct,
  [CoachingStyle.STRATEGIC]: colors.strategic,
  [CoachingStyle.DRIVEN]: colors.driven,
};
import { useAuth } from '../../hooks/useAuth';
import { useUserId } from '../../hooks/useUserId';
import { supabase } from '../../lib/supabase';
import { UserIcon } from '../../components/UserIcon';

// ---------------------------------------------------------------------------
// Icon Components (Lucide-style, 14px default inside 36x36 icon boxes)
// ---------------------------------------------------------------------------

function ChevronRightIcon({ size = 12, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BrainIcon({ size = 14, color = '#A855F7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4 4 4 0 0 0 2.5 3.7V18a4 4 0 0 0 8 0v-3.3A4 4 0 0 0 17 11a4 4 0 0 0-4-4V6a4 4 0 0 0-1-4Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2v20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 6c-2 0-4 1-4 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 6c2 0 4 1 4 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MailIcon({ size = 14, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={4} width={20} height={16} rx={2} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LockIcon({ size = 14, color = colors.accent }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function KeyIcon({ size = 14, color = '#EAB308' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={7.5} cy={15.5} r={5.5} stroke={color} strokeWidth={2} />
      <Path d="m11.5 12.5 10-10" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 7l2.5 2.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 4l2.5 2.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DownloadIcon({ size = 14, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="7 10 12 15 17 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={15} x2={12} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ShieldIcon({ size = 14, color = '#F97316' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrashIcon({ size = 14, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BugIcon({ size = 16, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m8 2 1.88 1.88" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14.12 3.88 16 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 20v-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M6.53 9C4.6 8.8 3 7.1 3 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 13H2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 21c0-2.1 1.7-3.9 3.8-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 13h-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BarChartIcon({ size = 16, color = colors.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={18} y1={20} x2={18} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={20} x2={12} y2={4} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={6} y1={20} x2={6} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HelpCircleIcon({ size = 16, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={17} x2={12.01} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HeadphonesIcon({ size = 16, color = colors.accent }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FileTextIcon({ size = 16, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={16} y1={13} x2={8} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16} y1={17} x2={8} y2={17} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline points="10 9 9 9 8 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShieldCheckIcon({ size = 16, color = '#A855F7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m9 12 2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LogOutIcon({ size = 16, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={21} y1={12} x2={9} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ArrowLeftIcon({ size = 20, color = colors.textPrimary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m12 19-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PencilIcon({ size = 10, color = colors.indexBlue }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Reusable Components
// ---------------------------------------------------------------------------

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={styles.sectionLabel}>{title}</Text>
  );
}

interface IconBoxProps {
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}

function IconBox({ bgColor, borderColor, children }: IconBoxProps) {
  return (
    <View style={[styles.iconBox, { backgroundColor: bgColor, borderColor }]}>
      {children}
    </View>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  titleColor?: string;
  rowBg?: string;
  rowBorderColor?: string;
}

function SettingRow({
  icon,
  iconBg,
  iconBorder,
  title,
  subtitle,
  onPress,
  titleColor = colors.textPrimary,
  rowBg = colors.input,
  rowBorderColor = colors.border,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={styles.pressableWrap}
    >
      <View style={[styles.settingRow, { backgroundColor: rowBg, borderColor: rowBorderColor }]}>
        <IconBox bgColor={iconBg} borderColor={iconBorder}>{icon}</IconBox>
        <View style={styles.settingRowText}>
          <Text style={[styles.settingRowTitle, { color: titleColor }]}>{title}</Text>
          <Text style={styles.settingRowSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRightIcon />
      </View>
    </Pressable>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

function ToggleRow({ icon, iconBg, iconBorder, title, subtitle, value, onToggle }: ToggleRowProps) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
      <View style={styles.toggleRowLeft}>
        <IconBox bgColor={iconBg} borderColor={iconBorder}>{icon}</IconBox>
        <View style={styles.settingRowText}>
          <Text style={styles.settingRowTitle}>{title}</Text>
          <Text style={styles.settingRowSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(val);
        }}
        trackColor={{ false: '#3F3F46', true: colors.indexBlue }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#3F3F46"
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { signOut, user, profile } = useAuth();
  const userId = useUserId();
  const [telemetry, setTelemetry] = useState(true);
  const [identityStatement, setIdentityStatement] = useState<string | null>(null);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>(CoachingStyle.DIRECT);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('onboarding_profiles')
      .select('identity_statement')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.identity_statement) setIdentityStatement(data.identity_statement);
      });
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      supabase
        .from('ai_personality_profiles')
        .select('coaching_style')
        .eq('user_id', userId)
        .single()
        .then(({ data }) => {
          if (data?.coaching_style) setCoachingStyle(data.coaching_style as CoachingStyle);
        });
    }, [userId])
  );

  const userEmail = user?.email ?? profile?.email ?? '';
  const displayName = userEmail ? userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'User';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Nav Header */}
        <View style={styles.navHeader}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            hitSlop={12}
            style={styles.backBtn}
          >
            <ArrowLeftIcon size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Customize your Momentum experience</Text>
        </View>

        {/* PROFILE */}
        <View style={styles.section}>
          <SectionLabel title="PROFILE" />
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <UserIcon size={24} color={colors.textSecondary} />
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
              </View>
            </View>

            <View style={styles.profileDivider} />

            <View style={styles.identitySection}>
              <Text style={styles.identityLabel}>IDENTITY STATEMENT</Text>
              <View style={styles.identityBox}>
                <Text style={styles.identityText}>
                  {identityStatement ?? 'No identity statement set. Tap Edit Statement to add one.'}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/settings/identity');
                }}
                style={styles.editStatementBtn}
              >
                <PencilIcon size={10} />
                <Text style={styles.editStatementText}>Edit Statement</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* COACHING STYLE */}
        <View style={styles.section}>
          <SectionLabel title="COACHING STYLE" />
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/settings/mode');
            }}
            style={styles.pressableWrap}
          >
            <View style={[styles.settingRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <IconBox bgColor="rgba(168,85,247,0.1)" borderColor="rgba(168,85,247,0.2)">
                <BrainIcon />
              </IconBox>
              <View style={styles.settingRowText}>
                <Text style={styles.settingRowTitle}>Current Style</Text>
                <View style={styles.coachingBadgeRow}>
                  <View style={[styles.coachingBadge, { borderColor: STYLE_COLORS[coachingStyle], backgroundColor: `${STYLE_COLORS[coachingStyle]}18` }]}>
                    <Text style={[styles.coachingBadgeText, { color: STYLE_COLORS[coachingStyle] }]}>{coachingStyle}</Text>
                  </View>
                  <Text style={styles.settingRowSubtitle}>{COACHING_STYLE_DESCRIPTIONS[coachingStyle]}</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </View>
          </Pressable>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <SectionLabel title="ACCOUNT" />
          <View style={styles.cardGroup}>
            <SettingRow
              icon={<MailIcon />}
              iconBg="rgba(59,130,246,0.1)"
              iconBorder="rgba(59,130,246,0.2)"
              title="Email"
              subtitle={userEmail || 'Not set'}
            />
            <SettingRow
              icon={<LockIcon />}
              iconBg="rgba(16,185,129,0.1)"
              iconBorder="rgba(16,185,129,0.2)"
              title="Password"
              subtitle="Change your password"
            />
            <SettingRow
              icon={<KeyIcon />}
              iconBg="rgba(234,179,8,0.1)"
              iconBorder="rgba(234,179,8,0.2)"
              title="Authentication Methods"
              subtitle="Manage login options"
            />
          </View>
        </View>

        {/* SECURITY & PRIVACY */}
        <View style={styles.section}>
          <SectionLabel title="SECURITY & PRIVACY" />
          <View style={styles.cardGroup}>
            <SettingRow
              icon={<DownloadIcon />}
              iconBg="rgba(59,130,246,0.1)"
              iconBorder="rgba(59,130,246,0.2)"
              title="Export Data"
              subtitle="Download your information"
            />
            <SettingRow
              icon={<ShieldIcon />}
              iconBg="rgba(249,115,22,0.1)"
              iconBorder="rgba(249,115,22,0.2)"
              title="Privacy & Data"
              subtitle="RLS policies & data handling"
            />
            <SettingRow
              icon={<TrashIcon />}
              iconBg="rgba(239,68,68,0.2)"
              iconBorder="rgba(239,68,68,0.4)"
              title="Delete Account"
              subtitle="Permanently remove your data"
              titleColor="#EF4444"
              rowBg="rgba(239,68,68,0.1)"
              rowBorderColor="rgba(239,68,68,0.3)"
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'This action is permanent and cannot be undone. All your data will be removed.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive' },
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* ADVANCED */}
        <View style={styles.section}>
          <SectionLabel title="ADVANCED" />
          <View style={styles.cardGroup}>
            <SettingRow
              icon={<BugIcon />}
              iconBg="rgba(239,68,68,0.1)"
              iconBorder="rgba(239,68,68,0.2)"
              title="Debug Mode"
              subtitle="Developer tools & logs"
            />
            <ToggleRow
              icon={<BarChartIcon />}
              iconBg={colors.border}
              iconBorder={colors.border}
              title="Telemetry"
              subtitle="Anonymous usage data"
              value={telemetry}
              onToggle={setTelemetry}
            />
          </View>
        </View>

        {/* HELP & LEGAL */}
        <View style={styles.section}>
          <SectionLabel title="HELP & LEGAL" />
          <View style={styles.cardGroup}>
            <SettingRow
              icon={<HelpCircleIcon />}
              iconBg="rgba(59,130,246,0.1)"
              iconBorder="rgba(59,130,246,0.2)"
              title="FAQ / How It Works"
              subtitle="Momentum Index explained"
            />
            <SettingRow
              icon={<HeadphonesIcon />}
              iconBg="rgba(16,185,129,0.1)"
              iconBorder="rgba(16,185,129,0.2)"
              title="Contact Support"
              subtitle="Get help from our team"
            />
            <SettingRow
              icon={<FileTextIcon />}
              iconBg="rgba(59,130,246,0.1)"
              iconBorder="rgba(59,130,246,0.2)"
              title="Terms of Service"
              subtitle="User agreement"
            />
            <SettingRow
              icon={<ShieldCheckIcon />}
              iconBg="rgba(168,85,247,0.1)"
              iconBorder="rgba(168,85,247,0.2)"
              title="Privacy Policy"
              subtitle="Data handling practices"
            />
          </View>
        </View>

        {/* VERSION INFO */}
        <View style={styles.versionCard}>
          <Text style={styles.versionLabel}>MOMENTUM v1.0.0</Text>
          <Text style={styles.versionBuild}>Build 2024.01.16</Text>
        </View>

        {/* LOG OUT */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
              ]
            );
          }}
          style={styles.pressableWrap}
        >
          <View style={styles.logOutBtn}>
            <LogOutIcon />
            <Text style={styles.logOutText}>Log Out</Text>
          </View>
        </Pressable>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Nav Header
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Page Header
  pageHeader: {
    gap: 2,
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardGroup: {
    gap: 6,
  },

  // Pressable wrapper — touch only, no layout styles
  pressableWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Setting Row (card-style) — layout lives on a View, not Pressable
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  settingRowText: {
    flex: 1,
    gap: 1.5,
  },
  settingRowTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textPrimary,
  },
  settingRowSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  // Icon Box
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Card
  profileCard: {
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.3)',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  profileEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  identitySection: {
    gap: 6,
  },
  identityLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    lineHeight: 13.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  identityBox: {
    backgroundColor: '#0F0F11',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 11,
  },
  identityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 19.5,
    color: '#EDEDED',
  },
  editStatementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 1.5,
  },
  editStatementText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.indexBlue,
  },

  // Coaching Style
  coachingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachingBadge: {
    backgroundColor: 'rgba(168,85,247,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  coachingBadgeText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: '#A855F7',
  },

  // Version
  versionCard: {
    backgroundColor: 'rgba(39,39,42,0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(39,39,42,0.5)',
    padding: 13,
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.md,
  },
  versionLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  versionBuild: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Log Out
  logOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    marginBottom: spacing.sm,
  },
  logOutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});
