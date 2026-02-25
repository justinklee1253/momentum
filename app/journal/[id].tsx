import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Journal } from '../../lib/database.types';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUserId } from '../../hooks/useUserId';
import { useSignalLog } from '../../hooks/useSignalLog';

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useUserId();
  const { todayEntry } = useSignalLog(userId);

  const { data: entry, isLoading } = useQuery<Journal>({
    queryKey: ['journal', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('journals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });

  const isToday = !!entry && entry.id === todayEntry?.id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← SIGNAL</Text>
        </Pressable>
        <View style={styles.headerRight}>
          {entry && (
            <Text style={styles.dateText}>
              {format(new Date(entry.date), 'EEE, MMM d yyyy').toUpperCase()}
            </Text>
          )}
          {isToday && (
            <Pressable onPress={() => router.push('/journal/new')} style={styles.editBtn}>
              <Text style={styles.editText}>EDIT</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={20} />
            <Skeleton height={20} width="85%" />
            <Skeleton height={20} width="70%" />
          </View>
        ) : entry ? (
          <>
            {entry.mood && (
              <View style={styles.clarityRow}>
                <Text style={styles.clarityLabel}>CLARITY</Text>
                <Text style={styles.clarityValue}>{entry.mood}/10</Text>
              </View>
            )}
            <Text style={styles.content}>{entry.content}</Text>
            {entry.tags && entry.tags.length > 0 && (
              <View style={styles.tags}>
                <Text style={styles.tagsLabel}>TAGS</Text>
                <View style={styles.tagsList}>
                  {entry.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.notFound}>Signal entry not found.</Text>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.micro,
    color: colors.textMuted,
  },
  editBtn: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderActive,
  },
  editText: {
    ...typography.micro,
    color: colors.accent,
    fontSize: 11,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  clarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  clarityLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  clarityValue: {
    ...typography.subhead,
    color: colors.accent,
  },
  content: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  tags: {
    marginTop: spacing.xl,
  },
  tagsLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.input,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
