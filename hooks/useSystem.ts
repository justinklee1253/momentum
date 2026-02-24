import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AIConversation } from '../lib/database.types';

export function useSystem(userId: string | null, sessionId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<AIConversation[]>({
    queryKey: ['conversations', userId, sessionId],
    enabled: !!userId && !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId!)
        .eq('session_id', sessionId!)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data ?? [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({ message, activeSessionId }: { message: string; activeSessionId: string }) => {
      const userMsg = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId!, session_id: activeSessionId, role: 'USER', content: message })
        .select()
        .single();

      if (userMsg.error) throw userMsg.error;

      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeSessionId);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Session expired. Please sign in again.');
      }

      const response = await supabase.functions.invoke('ai-chat', {
        body: { userId, message, sessionId: activeSessionId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        console.error('ai-chat edge function error:', JSON.stringify(response.error));
        throw response.error;
      }
      return response.data;
    },
    onMutate: async ({ message, activeSessionId }) => {
      const qk = ['conversations', userId, activeSessionId];
      await queryClient.cancelQueries({ queryKey: qk });

      // Snapshot server-confirmed messages only (strip any temp-* rows) for clean rollback
      const all = queryClient.getQueryData<AIConversation[]>(qk) ?? [];
      const previous = all.filter(m => !m.id.startsWith('temp-'));

      // Only add optimistic message if seedAndSend hasn't already done it
      if (!all.some(m => m.id.startsWith('temp-'))) {
        queryClient.setQueryData<AIConversation[]>(qk, () => [
          ...previous,
          {
            id: `temp-${Date.now()}`,
            user_id: userId!,
            session_id: activeSessionId,
            role: 'USER',
            content: message,
            metadata: null,
            created_at: new Date().toISOString(),
          } as AIConversation,
        ]);
      }

      return { previous, activeSessionId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['conversations', userId, context.activeSessionId],
          context.previous,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId, variables.activeSessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat_sessions', userId] });
    },
  });

  const seedAndSend = async (message: string, activeSessionId: string) => {
    const qk = ['conversations', userId, activeSessionId];
    queryClient.setQueryData<AIConversation[]>(qk, (old) => [
      ...(old ?? []),
      {
        id: `temp-${Date.now()}`,
        user_id: userId!,
        session_id: activeSessionId,
        role: 'USER',
        content: message,
        metadata: null,
        created_at: new Date().toISOString(),
      } as AIConversation,
    ]);
    return sendMutation.mutateAsync({ message, activeSessionId });
  };

  return {
    ...query,
    sendMessage: (message: string, activeSessionId: string) =>
      sendMutation.mutateAsync({ message, activeSessionId }),
    seedAndSend,
    isSending: sendMutation.isPending,
  };
}
