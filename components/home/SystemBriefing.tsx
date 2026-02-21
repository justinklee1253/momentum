import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '../../lib/theme';
import { Skeleton } from '../ui/Skeleton';

interface BriefingData {
  title?: string;
  body: string;
  priorities?: string[];
}

interface SystemBriefingProps {
  content: string | null;
  loading?: boolean;
}

function parseBriefingContent(content: string): BriefingData {
  const lines = content.trim().split('\n').filter(Boolean);

  const priorities: string[] = [];
  const bodyLines: string[] = [];
  let title = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!title && trimmed.length > 0 && trimmed.length <= 60 && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      title = trimmed;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      priorities.push(trimmed.slice(2));
    } else {
      bodyLines.push(trimmed);
    }
  }

  if (!title && bodyLines.length > 0) {
    title = bodyLines.shift()!;
  }

  return {
    title: title || 'Daily Briefing',
    body: bodyLines.join(' '),
    priorities: priorities.length > 0 ? priorities : undefined,
  };
}

function AIBadgeIcon() {
  return (
    <View style={styles.aiBadge}>
      <Svg width={12} height={10} viewBox="0 0 12 10" fill="none">
        <Path
          d="M1 5L4 1H8L11 5L8 9H4L1 5Z"
          stroke={colors.indexBlue}
          strokeWidth={1.5}
          fill="rgba(59,130,246,0.2)"
        />
      </Svg>
    </View>
  );
}

export function SystemBriefing({ content, loading = false }: SystemBriefingProps) {
  const briefing = content ? parseBriefingContent(content) : null;

  return (
    <View style={styles.cardOuter}>
      <LinearGradient
        colors={[colors.input, '#0F0F11']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.shadowOverlay} />

      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <AIBadgeIcon />
          <Text style={styles.headerText}>AI GENERATED · TODAY</Text>
        </View>

        {loading ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Skeleton height={24} width="80%" />
            <Skeleton height={16} />
            <Skeleton height={16} width="85%" />
            <Skeleton height={16} width="70%" />
          </View>
        ) : briefing ? (
          <>
            <Text style={styles.title}>{briefing.title}</Text>
            <Text style={styles.body}>{briefing.body}</Text>

            {briefing.priorities && briefing.priorities.length > 0 && (
              <View style={styles.priorityBox}>
                <Text style={styles.priorityLabel}>PRIORITY LIST</Text>
                {briefing.priorities.map((item, i) => (
                  <View key={i} style={styles.priorityItem}>
                    <Text style={styles.priorityBullet}>·</Text>
                    <Text style={styles.priorityText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

          </>
        ) : (
          <Text style={styles.placeholder}>Generating your briefing...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(59,130,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.indexBlue,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 25,
    color: '#FFFFFF',
    marginTop: 11,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22.75,
    color: colors.textSecondary,
    marginTop: 7,
  },
  priorityBox: {
    marginTop: 16,
    backgroundColor: 'rgba(39,39,42,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(39,39,42,0.5)',
    borderRadius: 8,
    padding: 13,
    gap: 8,
  },
  priorityLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  priorityBullet: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.indexBlue,
    paddingTop: 2,
  },
  priorityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#EDEDED',
    flex: 1,
  },
  placeholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
