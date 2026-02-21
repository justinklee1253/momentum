import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AIConversation } from '../lib/database.types';

export function useSystem(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<AIConversation[]>({
    queryKey: ['conversations', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data ?? [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      // Optimistically insert user message
      const userMsg = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId!, role: 'USER', content: message })
        .select()
        .single();

      if (userMsg.error) throw userMsg.error;

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { userId, message },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
    onMutate: async (message) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] });
      const previous = queryClient.getQueryData<AIConversation[]>(['conversations', userId]);
      queryClient.setQueryData<AIConversation[]>(['conversations', userId], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          user_id: userId!,
          role: 'USER',
          content: message,
          metadata: null,
          created_at: new Date().toISOString(),
        } as AIConversation,
      ]);
      return { previous };
    },
    onError: (_err, _msg, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversations', userId], context.previous);
      }
    },
  });

  return {
    ...query,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}
