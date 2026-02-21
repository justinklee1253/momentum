import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date().toISOString().split('T')[0];

    const [profileRes, logsRes, journalsRes] = await Promise.all([
      supabase.from('onboarding_profiles').select('identity_statement').eq('user_id', userId).single(),
      supabase.from('habit_logs').select('status').eq('user_id', userId).eq('date', today),
      supabase.from('journals').select('tags').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    ]);

    const identity = profileRes.data?.identity_statement ?? '';
    const logs = logsRes.data ?? [];
    const todayRatio = logs.length > 0
      ? logs.filter((l: any) => l.status === 'DONE' || l.status === 'PARTIAL').length / logs.length
      : 0;

    const recentTags = (journalsRes.data ?? [])
      .flatMap((j: any) => j.tags ?? [])
      .filter((tag: string, i: number, arr: string[]) => arr.indexOf(tag) === i)
      .slice(0, 5);

    const prompt = `Generate one targeted journaling prompt.

OPERATOR IDENTITY: "${identity}"
TODAY EXECUTION: ${Math.round(todayRatio * 100)}%
RECENT SIGNAL TAGS: ${recentTags.length ? recentTags.join(', ') : 'none'}

RULES:
- One sentence only
- Direct and specific to execution data
- No emoji
- ${todayRatio >= 0.7 ? 'They are executing well — probe what is driving it' : 'They are drifting — probe friction without guilt'}
- Clinical tone, not wellness`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 60,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const promptText = completion.choices[0]?.message?.content ?? 'What is the one thing you avoided executing today?';

    return new Response(JSON.stringify({ prompt: promptText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
