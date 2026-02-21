import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { useSignalLog } from '../../hooks/useSignalLog';
import { useUserId } from '../../hooks/useUserId';
import { Journal } from '../../lib/database.types';
import { Skeleton } from '../../components/ui/Skeleton';

const DELETE_RED = '#EF4444';

function getClarityColor(mood: number | null): string {
  if (!mood) return colors.textMuted;
  if (mood >= 8) return colors.accent;
  if (mood >= 5) return '#EAB308';
  return '#EF4444';
}

function JournalEntryCard({
  entry,
  onDelete,
  isDeleting,
}: {
  entry: Journal;
  onDelete: (id: string) => void | Promise<void>;
  isDeleting: boolean;
}) {
  const clarityColor = getClarityColor(entry.mood ?? null);

  const handleDeletePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Delete signal',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
      ]
    );
  };

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/journal/${entry.id}` as any);
      }}
      style={({ pressed }) => [styles.entryCard, pressed && styles.pressed]}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {format(new Date(entry.date), 'EEE, MMM d').toUpperCase()}
        </Text>
        {entry.mood && (
          <View style={styles.clarityBadge}>
            <Text style={styles.clarityLabel}>CLARITY</Text>
            <Text style={[styles.clarityValue, { color: clarityColor }]}>{entry.mood}/10</Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={handleDeletePress}
        disabled={isDeleting}
        hitSlop={12}
        style={styles.deleteWrap}
      >
        <View style={styles.deleteIconGlow} />
        <View style={styles.deleteIcon}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={DELETE_RED} />
          ) : (
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={DELETE_RED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            </Svg>
          )}
        </View>
      </Pressable>
      <Text style={styles.entryContent} numberOfLines={3}>
        {entry.content}
      </Text>
      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tags}>
          {entry.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export default function JournalTab() {
  const userId = useUserId();
  const { data: entries, isLoading, deleteEntry, isDeletingId } = useSignalLog(userId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>SIGNAL</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/journal/new');
          }}
          style={styles.newButton}
        >
          <Text style={styles.newButtonText}>+ LOG SIGNAL</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.content}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={100} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
          ))}
        </View>
      ) : entries && entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onDelete={async (id) => {
                await deleteEntry(id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              isDeleting={isDeletingId === item.id}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={<View style={{ height: spacing.xxl }} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO SIGNALS LOGGED</Text>
          <Text style={styles.emptyText}>
            Start logging your operational debrief. Tap the button above.
          </Text>
        </View>
      )}
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    ...typography.micro,
    color: colors.textMuted,
    letterSpacing: 3,
    fontSize: 13,
  },
  newButton: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borderActive,
  },
  newButtonText: {
    ...typography.micro,
    color: colors.accent,
    fontSize: 11,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryDate: {
    ...typography.micro,
    color: colors.textMuted,
  },
  clarityBadge: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  clarityLabel: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 9,
  },
  clarityValue: {
    ...typography.caption,
    fontWeight: '700',
  },
  deleteWrap: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  deleteIconGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: DELETE_RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  entryContent: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.input,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 1.5,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
