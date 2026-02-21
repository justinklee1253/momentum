import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { colors, spacing } from '../../lib/theme';
import { Journal } from '../../lib/database.types';
import { Skeleton } from '../ui/Skeleton';

interface RecentSignalsProps {
  entries: Journal[];
  loading?: boolean;
}

function getClarityColor(mood: number | null): { text: string; bg: string } {
  if (!mood) return { text: colors.textMuted, bg: 'rgba(82,82,91,0.1)' };
  if (mood >= 8) return { text: colors.accent, bg: 'rgba(16,185,129,0.1)' };
  if (mood >= 5) return { text: '#EAB308', bg: 'rgba(234,179,8,0.1)' };
  return { text: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
}

function SignalEntry({ entry, isLast }: { entry: Journal; isLast: boolean }) {
  const time = format(new Date(entry.created_at), 'hh:mm a').toUpperCase();
  const clarity = getClarityColor(entry.mood);
  const dotColor = (entry.mood ?? 0) >= 7 ? colors.indexBlue : colors.textSecondary;

  return (
    <View style={[styles.entry, isLast && { marginBottom: 0 }]}>
      <View style={[styles.timelineDot, { borderColor: dotColor }]} />
      <View style={styles.entryContent}>
        <View style={styles.entryHeader}>
          <Text style={styles.timeText}>{time}</Text>
          {entry.mood != null && (
            <View style={[styles.clarityBadge, { backgroundColor: clarity.bg }]}>
              <Text style={[styles.clarityText, { color: clarity.text }]}>
                CLARITY: {entry.mood}/10
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.entryBody} numberOfLines={3}>
          {entry.content}
        </Text>
      </View>
    </View>
  );
}

export function RecentSignals({ entries, loading = false }: RecentSignalsProps) {
  const recent = entries.slice(0, 3);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.timeline}>
          <View style={{ gap: 24 }}>
            {[...Array(2)].map((_, i) => (
              <View key={i} style={{ gap: 8, paddingLeft: 17 }}>
                <Skeleton width={80} height={14} />
                <Skeleton height={40} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (recent.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No signals logged yet today.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.timeline}>
        <View style={styles.timelineLine} />
        {recent.map((entry, index) => (
          <SignalEntry
            key={entry.id}
            entry={entry}
            isLast={index === recent.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 17,
  },
  timeline: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: colors.border,
  },
  entry: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: colors.input,
    marginLeft: -4.5,
    marginTop: 4,
    marginRight: 12.5,
    zIndex: 1,
  },
  entryContent: {
    flex: 1,
    gap: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timeText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  clarityBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  clarityText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    lineHeight: 15,
  },
  entryBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#EDEDED',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
