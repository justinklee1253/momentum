import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

export function useBriefing(userId: string | null) {
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery<string | null>({
    queryKey: ['briefing', userId, today],
    enabled: !!userId,
    staleTime: Infinity,
    queryFn: async () => {
      // Check cache first
      const { data: cached } = await supabase
        .from('daily_greetings')
        .select('content')
        .eq('user_id', userId!)
        .eq('date', today)
        .single();

      if (cached?.content) return cached.content;

      // Generate new briefing via Edge Function
      const { data, error } = await supabase.functions.invoke('daily-briefing', {
        body: { userId, date: today },
      });

      if (error) return null;
      return data?.content ?? null;
    },
  });
}
