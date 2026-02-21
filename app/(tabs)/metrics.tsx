import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, fontWeights } from '../../lib/theme';
import { useMetrics } from '../../hooks/useMetrics';
import { useProtocols } from '../../hooks/useProtocols';
import { useUserId } from '../../hooks/useUserId';
import { Skeleton } from '../../components/ui/Skeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { mockProtocolHealth } from '../../lib/formulas';

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
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
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

function getMomentumLabelColor(label: string): string {
  switch (label) {
    case 'LOCKED IN': return colors.accent;
    case 'BUILDING': return colors.indexBlue;
    case 'DRIFTING': return '#F59E0B';
    default: return '#EF4444';
  }
}

function HealthBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? colors.accent : value >= 45 ? '#F59E0B' : '#EF4444';
  return (
    <View style={healthStyles.row}>
      <Text style={healthStyles.label} numberOfLines={1}>{label}</Text>
      <View style={healthStyles.barContainer}>
        <View style={[healthStyles.bar, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[healthStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const healthStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 130,
  },
  barContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  value: {
    ...typography.caption,
    fontWeight: fontWeights.semibold,
    width: 28,
    textAlign: 'right',
  },
});

function SimpleTrendChart({ data }: { data: Array<{ date: string; score: number }> }) {
  const maxScore = 100;
  const chartHeight = 80;
  const points = data.slice(-30);

  if (points.length < 2) {
    return (
      <View style={trendStyles.container}>
        <Text style={trendStyles.insufficientText}>Insufficient data for trend visualization.</Text>
      </View>
    );
  }

  return (
    <View style={trendStyles.container}>
      <View style={trendStyles.chart}>
        {points.map((point, i) => {
          const barHeight = Math.max(2, (point.score / maxScore) * chartHeight);
          const isRecent = i >= points.length - 7;
          return (
            <View
              key={point.date}
              style={[
                trendStyles.bar,
                {
                  height: barHeight,
                  backgroundColor: isRecent ? colors.accent : colors.indexBlueMuted,
                  opacity: 0.6 + (i / points.length) * 0.4,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={trendStyles.footer}>
        <Text style={trendStyles.dateLabel}>{points[0]?.date?.slice(5) ?? ''}</Text>
        <Text style={trendStyles.dateLabel}>{points[points.length - 1]?.date?.slice(5) ?? ''}</Text>
      </View>
    </View>
  );
}

const trendStyles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  dateLabel: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 9,
  },
  insufficientText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default function MetricsTab() {
  const userId = useUserId();
  const metrics = useMetrics(userId);
  const protocols = useProtocols(userId);

  const isLoading = metrics.isLoading || protocols.isLoading;
  const labelColor = metrics.data ? getMomentumLabelColor(metrics.data.label) : colors.textMuted;

  return (
    <View style={styles.container}>
      <Header score={metrics.data?.momentumScore ?? 0} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          {isLoading ? (
            <>
              <Skeleton height={52} width={120} style={{ marginBottom: spacing.sm }} />
              <Skeleton height={20} width={100} />
            </>
          ) : (
            <>
              <Text style={styles.scoreLabel}>MOMENTUM INDEX</Text>
              <Text style={styles.score}>{metrics.data?.momentumScore ?? 0}</Text>
              <Text style={[styles.stateLabel, { color: labelColor }]}>
                {metrics.data?.label ?? 'OFF TRACK'}
              </Text>

              <View style={styles.deltaRow}>
                <View style={styles.deltaItem}>
                  <Text style={styles.deltaLabel}>7D DELTA</Text>
                  <Text style={[
                    styles.deltaValue,
                    {
                      color: (metrics.data?.trendDelta ?? 0) > 0
                        ? colors.accent
                        : (metrics.data?.trendDelta ?? 0) < 0
                        ? '#EF4444'
                        : colors.textMuted,
                    },
                  ]}>
                    {(metrics.data?.trendDelta ?? 0) > 0 ? '+' : ''}
                    {metrics.data?.trendDelta ?? 0}
                  </Text>
                </View>
                <View style={styles.deltaItem}>
                  <Text style={styles.deltaLabel}>30D CONSISTENCY</Text>
                  <Text style={styles.deltaValue}>{metrics.data?.consistencyRate ?? 0}%</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="30-DAY TREND" />
          <View style={styles.trendCard}>
            {isLoading ? (
              <Skeleton height={80} />
            ) : metrics.data?.history && metrics.data.history.length > 0 ? (
              <SimpleTrendChart data={metrics.data.history} />
            ) : (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>No trend data yet. Keep executing.</Text>
              </View>
            )}
          </View>
        </View>

        {protocols.data && protocols.data.protocols.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="PROTOCOL HEALTH" />
            <View style={styles.healthCard}>
              <Text style={styles.healthNote}>
                * Hash-based estimation — real aggregation coming in next update
              </Text>
              {protocols.data.protocols.map((p) => (
                <HealthBar
                  key={p.id}
                  label={p.title}
                  value={metrics.data?.protocolHealth[p.id] ?? mockProtocolHealth(p.id)}
                />
              ))}
            </View>
          </View>
        )}

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
    paddingHorizontal: 17,
    paddingBottom: 13,
    backgroundColor: 'rgba(24,24,27,0.7)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.indexBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
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
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    overflow: 'hidden',
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  score: {
    fontSize: 72,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 80,
  },
  stateLabel: {
    ...typography.subhead,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  deltaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  deltaItem: {
    alignItems: 'center',
  },
  deltaLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: 2,
  },
  deltaValue: {
    ...typography.subhead,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  trendCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noData: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  noDataText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  healthCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  healthNote: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    fontSize: 11,
  },
});
