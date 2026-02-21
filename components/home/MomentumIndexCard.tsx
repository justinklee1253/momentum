import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { G, Path } from 'react-native-svg';
import { colors, spacing } from '../../lib/theme';
import { Skeleton } from '../ui/Skeleton';

interface MomentumIndexCardProps {
  score: number;
  label: string;
  trendDelta: number;
  trendDirection: 'up' | 'down' | 'stable';
  consistencyRate: number;
  history?: Array<{ date: string; score: number }>;
  loading?: boolean;
}

function TrendArrow() {
  return (
    <Svg width={11} height={10} viewBox="0 0 11 10" fill="none">
      <Path d="M5.5 1L9.5 5H6.5V9H4.5V5H1.5L5.5 1Z" fill={colors.accent} />
    </Svg>
  );
}

function GaugeIcon({ score }: { score: number }) {
  const progress = Math.min(score / 100, 1);
  const circumference = 177.78;
  const maxVisible = 163.56;
  const progressDash = progress * maxVisible;

  const ringPath =
    'M30.9609 2.66667C46.5769 2.66667 59.2551 15.3449 59.2551 30.9609C59.2551 46.5769 46.5769 59.2551 30.9609 59.2551C15.3449 59.2551 2.66667 46.5769 2.66667 30.9609C2.66667 15.3449 15.3449 2.66667 30.9609 2.66667';

  const flamePath =
    'M4.35586 0.148347C4.56914 -0.0512625 4.9 -0.0485281 5.11328 0.151081C5.86797 0.859284 6.57617 1.62218 7.23789 2.44796C7.53867 2.05421 7.88047 1.62491 8.24961 1.27491C8.46562 1.07257 8.79922 1.07257 9.01523 1.27764C9.96133 2.17999 10.7625 3.37217 11.3258 4.50421C11.8809 5.61983 12.25 6.76007 12.25 7.56397C12.25 11.053 9.52109 14.0007 6.125 14.0007C2.69062 14.0007 0 11.0503 0 7.56124C0 6.51124 0.486719 5.22882 1.24141 3.96007C2.0043 2.67217 3.08164 1.3296 4.35586 0.148347V0.148347M6.17148 11.3757C6.86328 11.3757 7.47578 11.1843 8.05273 10.8015C9.20391 9.99757 9.51289 8.38975 8.82109 7.12647C8.69805 6.88038 8.38359 6.86397 8.20586 7.07178L7.5168 7.87296C7.33633 8.08077 7.01094 8.0753 6.84141 7.85928C6.39023 7.28507 5.58359 6.25968 5.12422 5.67725C4.95195 5.4585 4.62383 5.45577 4.44883 5.67452C3.52461 6.83663 3.05977 7.56944 3.05977 8.39249C3.0625 10.2655 4.44609 11.3757 6.17148 11.3757V11.3757';

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={64} height={64} viewBox="0 0 61.9218 61.9218">
        {/* Background track */}
        <Path
          d={ringPath}
          stroke="#27272A"
          strokeWidth={5.33333}
          strokeLinecap="round"
          strokeDasharray={`${maxVisible} ${circumference}`}
          fill="none"
        />
        {/* Progress ring */}
        <Path
          d={ringPath}
          stroke="#3B82F6"
          strokeWidth={5.33333}
          strokeLinecap="round"
          strokeDasharray={`${progressDash} ${circumference}`}
          fill="none"
        />
        {/* Flame icon centered */}
        <G translate={`${30.9609 - 6.125}, ${30.9609 - 7}`}>
          <Path d={flamePath} fill="#3B82F6" />
        </G>
      </Svg>
    </View>
  );
}

function Sparkline({ history }: { history: Array<{ date: string; score: number }> }) {
  if (history.length < 2) {
    return <View style={styles.sparklinePlaceholder} />;
  }

  const width = 360;
  const height = 50;
  const padding = 2;
  const scores = history.map((h) => h.score);
  const min = Math.min(...scores) - 5;
  const max = Math.max(...scores) + 5;
  const range = max - min || 1;

  const points = scores.map((s, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - padding * 2);
    const y = height - padding - ((s - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${width - padding},${height} L${padding},${height} Z`;

  return (
    <View style={styles.sparklineContainer}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Path d={areaPath} fill="rgba(59,130,246,0.08)" />
        <Path d={linePath} stroke={colors.indexBlue} strokeWidth={2} fill="none" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export function MomentumIndexCard({
  score,
  label,
  trendDelta,
  trendDirection,
  consistencyRate,
  history = [],
  loading = false,
}: MomentumIndexCardProps) {
  const deltaSign = trendDelta > 0 ? '+' : '';
  const deltaColor = trendDirection === 'up' ? colors.accent : trendDirection === 'down' ? '#EF4444' : colors.textMuted;
  const lastComputed = '04:00 AM';

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/metrics');
  }

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.topRow}>
        <View style={styles.scoreSection}>
          <Text style={styles.indexLabel}>MOMENTUM INDEX</Text>
          <View style={styles.scoreRow}>
            {loading ? (
              <Skeleton width={100} height={40} />
            ) : (
              <>
                <Text style={styles.scoreText}>{score.toFixed(1)}</Text>
                {trendDelta !== 0 && (
                  <View style={styles.trendBadge}>
                    {trendDirection === 'up' && <TrendArrow />}
                    <Text style={styles.trendText}>{deltaSign}{trendDelta.toFixed(1)}%</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
        {loading ? (
          <Skeleton width={64} height={64} style={{ borderRadius: 32 }} />
        ) : (
          <GaugeIcon score={score} />
        )}
      </View>

      <View style={styles.sparklineWrap}>
        {loading ? (
          <Skeleton height={50} style={{ borderRadius: 4 }} />
        ) : (
          <Sparkline history={history} />
        )}
      </View>

      <View style={styles.divider}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>LAST COMPUTED: {lastComputed}</Text>
          <Text style={styles.metaText}>
            DELTA: {deltaSign}{trendDelta.toFixed(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.input,
    borderRadius: 16,
    padding: 21,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scoreSection: {
    gap: 4,
  },
  indexLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: 8,
  },
  scoreText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.9,
    color: '#FFFFFF',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.accent,
  },
  gaugeContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklineWrap: {
    marginTop: spacing.sm,
    opacity: 0.8,
  },
  sparklineContainer: {
    height: 50,
  },
  sparklinePlaceholder: {
    height: 50,
    backgroundColor: 'rgba(59,130,246,0.04)',
    borderRadius: 4,
  },
  divider: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
});
