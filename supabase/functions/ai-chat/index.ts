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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace(/^Bearer\s+/i, '')
    );
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId, message, sessionId } = await req.json();
    if (user.id !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch context in parallel
    const [profileRes, personalityRes, journalsRes, conversationsRes, metricsRes] = await Promise.all([
      supabase.from('onboarding_profiles').select('identity_statement, ideal_day').eq('user_id', userId).single(),
      supabase.from('ai_personality_profiles').select('coaching_style, tone_settings').eq('user_id', userId).single(),
      supabase.from('journals').select('content, date, mood, tags').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
      sessionId
        ? supabase.from('ai_conversations').select('role, content').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(10)
        : supabase.from('ai_conversations').select('role, content').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('metrics_snapshots').select('momentum_score, consistency_rate').eq('user_id', userId).order('date', { ascending: false }).limit(1),
    ]);

    const identity = profileRes.data?.identity_statement ?? '';
    const idealDay = profileRes.data?.ideal_day ?? '';
    const coachingStyle = personalityRes.data?.coaching_style ?? 'DIRECT';
    const journals = journalsRes.data ?? [];
    const history = (conversationsRes.data ?? []).reverse();
    const score = metricsRes.data?.[0]?.momentum_score ?? 0;
    const consistency = metricsRes.data?.[0]?.consistency_rate ?? 0;

    const journalContext = journals
      .map((j: any) => `[${j.date}] Clarity: ${j.mood ?? 'N/A'}/10\n${(j.content ?? '').slice(0, 300)}`)
      .join('\n\n');

    const modeInstructions: Record<string, string> = {
      DIRECT: 'State facts directly. Name what was missed. One directive per response.',
      STRATEGIC: 'Connect to identity. Ask one strategic question. Think long-term.',
      DRIVEN: "Emphasize what's working. Push harder on momentum. High energy, no coddling.",
    };

    const systemPrompt = `You are the system intelligence of Momentum — a personal execution system. Mission control operator who respects the operator but doesn't waste words.

OPERATOR IDENTITY: "${identity}"
IDEAL DAY: "${idealDay}"
OPERATING MODE: ${coachingStyle}
MOMENTUM INDEX: ${score}/100
CONSISTENCY RATE: ${consistency}%

RECENT SIGNAL LOG ENTRIES:
${journalContext || 'No recent entries.'}

RULES:
- Never say "great job", "amazing", "proud of you", "crushing it"
- Never say "failure", "worthless", "pathetic", "loser", "weak", "disappointing"
- No emojis
- Max 1 exclamation mark
- Under 80 words unless detail is explicitly requested
- Always ground responses in data first
- Call them "protocols" not habits or tasks
- Call the score the "Momentum Index" not "score" or "points"

MODE: ${modeInstructions[coachingStyle] ?? modeInstructions.DIRECT}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m: any) => ({
        role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      temperature: 0.7,
      messages,
    });

    const aiContent = completion.choices[0]?.message?.content ?? 'System unavailable.';

    await supabase.from('ai_conversations').insert({
      user_id: userId,
      role: 'AI',
      content: aiContent,
      ...(sessionId ? { session_id: sessionId } : {}),
    });

    return new Response(JSON.stringify({ content: aiContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
