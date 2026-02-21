import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../lib/theme';
import { MomentumIndexCard } from '../../components/home/MomentumIndexCard';
import { SystemBriefing } from '../../components/home/SystemBriefing';
import { ProtocolRow } from '../../components/home/ProtocolRow';
import { DateStrip } from '../../components/home/DateStrip';
import { QuickActions } from '../../components/home/QuickActions';
import { RecentSignals } from '../../components/home/RecentSignals';
import { TierDivider } from '../../components/ui/TierDivider';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useProtocols } from '../../hooks/useProtocols';
import { useMetrics } from '../../hooks/useMetrics';
import { useBriefing } from '../../hooks/useBriefing';
import { useSignalLog } from '../../hooks/useSignalLog';
import { useUserId } from '../../hooks/useUserId';
import { AnchorType } from '../../lib/constants';
import { RefreshControl } from 'react-native';

function BoltIcon() {
  return (
    <Svg width={10} height={11.43} viewBox="0 0 26.25 30.0011" fill="none">
      <Path
        d="M20.4727 2.61381C20.8184 1.81108 20.5605 0.873577 19.8516 0.357952C19.1426 -0.157673 18.1758 -0.110798 17.5137 0.463421L2.51367 13.5884C1.92773 14.104 1.7168 14.9302 1.99219 15.6568C2.26758 16.3833 2.9707 16.8755 3.75 16.8755H10.2832L5.77734 27.3872C5.43164 28.19 5.68945 29.1275 6.39844 29.6431C7.10742 30.1587 8.07422 30.1119 8.73633 29.5376L23.7363 16.4126C24.3223 15.897 24.5332 15.0708 24.2578 14.3443C23.9824 13.6177 23.2852 13.1314 22.5 13.1314H15.9668L20.4727 2.61381V2.61381"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={9} height={10} viewBox="0 0 10 10" fill="none">
      <Path d="M5 0v10M0 5h10" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ArchiveIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 8v13H3V8M1 3h22v5H1V3ZM10 12h4"
        stroke={colors.indexBlue}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Header({ score }: { score: number }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerLeft}>
        <LinearGradient
          colors={['#3B82F6', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <BoltIcon />
        </LinearGradient>
        <View>
          <Text style={styles.logoText}>MOMENTUM</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM ACTIVE</Text>
          </View>
        </View>
      </View>

      <View style={styles.headerRight}>
        <Pressable
          style={styles.searchBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <SearchIcon />
        </Pressable>

        <Pressable
          style={styles.avatarWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/settings');
          }}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>U</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{Math.round(score)}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export default function StatusTab() {
  const userId = useUserId();
  const protocols = useProtocols(userId);
  const metrics = useMetrics(userId);
  const briefing = useBriefing(userId);
  const signals = useSignalLog(userId);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isLoading = protocols.isLoading || metrics.isLoading;

  function handleRefresh() {
    protocols.refetch();
    metrics.refetch();
    briefing.refetch();
    signals.refetch();
  }

  return (
    <View style={styles.container}>
      <Header score={metrics.data?.momentumScore ?? 0} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Momentum Index */}
        <View style={styles.section}>
          {isLoading ? (
            <Skeleton height={200} style={{ borderRadius: 16 }} />
          ) : (
            <MomentumIndexCard
              score={metrics.data?.momentumScore ?? 0}
              label={metrics.data?.label ?? 'OFF TRACK'}
              trendDelta={metrics.data?.trendDelta ?? 0}
              trendDirection={metrics.data?.trendDirection ?? 'stable'}
              consistencyRate={metrics.data?.consistencyRate ?? 0}
              history={metrics.data?.history ?? []}
            />
          )}
        </View>

        {/* Mission Briefing */}
        <View style={styles.section}>
          <SectionHeader
            title="MISSION BRIEFING"
            action="Archive"
            actionIcon={<ArchiveIcon />}
          />
          <SystemBriefing
            content={briefing.data ?? null}
            loading={briefing.isLoading}
          />
        </View>

        {/* Date Strip */}
        <View style={styles.section}>
          <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
        </View>

        {/* Protocols */}
        <View style={styles.section}>
          <SectionHeader
            title="PROTOCOLS"
            rightContent={
              <View style={styles.protocolActions}>
                <Pressable style={styles.iconBtn}>
                  <FilterIcon />
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => router.push('/settings/add-protocol')}
                >
                  <PlusIcon />
                </Pressable>
              </View>
            }
          />

          {isLoading ? (
            <View style={{ gap: spacing.sm }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} height={56} style={{ borderRadius: 12 }} />
              ))}
            </View>
          ) : protocols.data ? (
            <View style={styles.protocolList}>
              {([AnchorType.NON_NEGOTIABLE, AnchorType.GROWTH, AnchorType.ROTATING_FOCUS] as AnchorType[]).map((tier) => {
                const tierProtocols = protocols.data!.byTier[tier];
                if (tierProtocols.length === 0) return null;
                return (
                  <View key={tier} style={styles.tierGroup}>
                    <TierDivider tier={tier} />
                    {tierProtocols.map((protocol) => (
                      <ProtocolRow
                        key={protocol.id}
                        protocol={protocol}
                        onToggle={(habitId, currentStatus) =>
                          protocols.toggleExecution({ habitId, currentStatus })
                        }
                        isToggling={protocols.isToggling}
                      />
                    ))}
                  </View>
                );
              })}

              {protocols.data.protocols.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No protocols configured.</Text>
                  <Text style={styles.emptySubtext}>
                    Complete onboarding to set up your protocols.
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions />
        </View>

        {/* Recent Signals */}
        <View style={styles.section}>
          <SectionHeader
            title="RECENT SIGNALS"
            action="View All"
            onAction={() => router.push('/journal')}
          />
          <RecentSignals
            entries={signals.data ?? []}
            loading={signals.isLoading}
          />
        </View>

        <View style={{ height: spacing.xxl + 40 }} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 21,
    paddingBottom: 17,
    backgroundColor: 'rgba(24,24,27,0.7)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.indexBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  logoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.35,
    color: '#EDEDED',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    lineHeight: 12,
    color: colors.indexBlue,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  protocolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolList: {
    gap: spacing.md,
  },
  tierGroup: {},
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
