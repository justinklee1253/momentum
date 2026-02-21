import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Call SQL functions
    const [scoreRes, rateRes] = await Promise.all([
      supabase.rpc('compute_momentum_score', { p_user_id: userId }),
      supabase.rpc('compute_consistency_rate', { p_user_id: userId }),
    ]);

    const score = scoreRes.data ?? 0;
    const rate = rateRes.data ?? 0;

    const today = new Date().toISOString().split('T')[0];

    await supabase.from('metrics_snapshots').upsert(
      { user_id: userId, date: today, momentum_score: score, consistency_rate: rate },
      { onConflict: 'user_id,date' }
    );

    return new Response(JSON.stringify({ momentum_score: score, consistency_rate: rate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
