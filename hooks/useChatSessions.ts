import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ChatSession } from '../lib/database.types';

export function useChatSessions(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<ChatSession[]>({
    queryKey: ['chat_sessions', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId!)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const createSession = useMutation({
    mutationFn: async (firstMessage: string) => {
      const title = firstMessage.length > 50
        ? firstMessage.slice(0, 50).trim() + '...'
        : firstMessage;

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId!, title })
        .select()
        .single();

      if (error) throw error;
      return data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions', userId] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions', userId] });
    },
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    createSession: createSession.mutateAsync,
    deleteSession: deleteSession.mutateAsync,
  };
}
