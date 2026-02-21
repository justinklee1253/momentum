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
    const { userId, date } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check cache
    const { data: cached } = await supabase
      .from('daily_greetings')
      .select('content')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (cached?.content) {
      return new Response(JSON.stringify({ content: cached.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch context
    const [profileRes, personalityRes, metricsRes, logsRes] = await Promise.all([
      supabase.from('onboarding_profiles').select('identity_statement').eq('user_id', userId).single(),
      supabase.from('ai_personality_profiles').select('coaching_style').eq('user_id', userId).single(),
      supabase.from('metrics_snapshots').select('momentum_score').eq('user_id', userId).order('date', { ascending: false }).limit(2),
      supabase.from('habit_logs').select('status').eq('user_id', userId).eq('date', date),
    ]);

    const identity = profileRes.data?.identity_statement ?? 'a high-performance operator';
    const coachingStyle = personalityRes.data?.coaching_style ?? 'DIRECT';
    const scores = metricsRes.data ?? [];
    const latestScore = scores[0]?.momentum_score ?? 0;
    const previousScore = scores[1]?.momentum_score ?? latestScore;
    const trendDirection = latestScore > previousScore ? 'up' : latestScore < previousScore ? 'down' : 'stable';

    const logs = logsRes.data ?? [];
    const yesterdayRatio = logs.length > 0
      ? logs.filter((l: any) => l.status === 'DONE' || l.status === 'PARTIAL').length / logs.length
      : 0;

    const modePrompts: Record<string, string> = {
      DIRECT: 'Be cold and precise. Name what was missed. One directive.',
      STRATEGIC: 'Connect execution to the identity arc. Ask one strategic question.',
      DRIVEN: 'Lead with what is working, then push the intensity.',
    };

    const prompt = `Generate a 2–3 sentence operational briefing.

OPERATOR IDENTITY: "${identity}"
YESTERDAY EXECUTION: ${Math.round(yesterdayRatio * 100)}% of protocols completed
MOMENTUM INDEX: ${latestScore}/100 (trending ${trendDirection})
MODE: ${coachingStyle}

RULES:
- No greeting, no "good morning"
- No emojis
- State facts about yesterday's execution first
- End with one clear directive for today
- Under 60 words total
- Clinical mission control tone — not a wellness app
- ${modePrompts[coachingStyle] ?? modePrompts.DIRECT}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? 'System data unavailable. Execute your protocols.';

    // Cache it
    await supabase.from('daily_greetings').upsert({ user_id: userId, date, content });

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
