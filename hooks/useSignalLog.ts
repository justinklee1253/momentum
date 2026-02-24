import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Journal } from '../lib/database.types';

export function useSignalLog(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<Journal[]>({
    queryKey: ['signal-log', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (entry: {
      content: string;
      mood: number;
      date?: string;
    }) => {
      const { data, error } = await supabase
        .from('journals')
        .insert({
          user_id: userId!,
          content: entry.content,
          mood: entry.mood,
          date: entry.date ?? format(new Date(), 'yyyy-MM-dd'),
        })
        .select()
        .single();

      if (error) throw error;

      // Fire-and-forget: embed the content for future RAG
      supabase.functions.invoke('embed-content', {
        body: { userId, sourceType: 'journal', sourceId: data.id, content: entry.content },
      }).catch(() => {}); // Non-blocking, best effort

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-log', userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (entry: { id: string; content: string; mood: number }) => {
      const { data, error } = await supabase
        .from('journals')
        .update({ content: entry.content, mood: entry.mood })
        .eq('id', entry.id)
        .eq('user_id', userId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-log', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-log', userId] });
    },
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = query.data?.find(e => e.date === today) ?? null;

  return {
    ...query,
    todayEntry,
    createEntry: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateEntry: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteEntry: deleteMutation.mutateAsync,
    isDeletingId: deleteMutation.isPending ? (deleteMutation.variables as string) : null,
  };
}
