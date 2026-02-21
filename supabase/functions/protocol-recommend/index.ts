import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// Stub — returns empty array. Full implementation is post-MVP.
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ recommendations: [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
