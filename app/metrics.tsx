import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, radius, fontWeights } from '../lib/theme';
import { useMetrics } from '../hooks/useMetrics';
import { useProtocols } from '../hooks/useProtocols';
import { useUserId } from '../hooks/useUserId';
import { Skeleton } from '../components/ui/Skeleton';
import { SectionHeader } from '../components/ui/SectionHeader';
import { mockProtocolHealth } from '../lib/formulas';

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

export default function MetricsScreen() {
  const userId = useUserId();
  const metrics = useMetrics(userId);
  const protocols = useProtocols(userId);

  const isLoading = metrics.isLoading || protocols.isLoading;
  const labelColor = metrics.data ? getMomentumLabelColor(metrics.data.label) : colors.textMuted;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← STATUS</Text>
        </Pressable>
        <Text style={styles.screenTitle}>METRICS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score hero */}
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

        {/* 30-Day Trend */}
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

        {/* Per-protocol health */}
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

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  backBtn: {
    padding: spacing.xs,
  },
  backText: {
    ...typography.micro,
    color: colors.accent,
    letterSpacing: 1,
  },
  screenTitle: {
    ...typography.micro,
    color: colors.textMuted,
    letterSpacing: 3,
    fontSize: 13,
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
