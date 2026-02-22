import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

/**
 * Auth redirect bridge page. Supabase redirects here (with hash fragment
 * #access_token=...&refresh_token=...&type=recovery) so in-app browsers
 * see a real page instead of a blank one. This page then redirects to
 * momentum:// so the app can open, with fallback instructions.
 */
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Opening Momentum</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090b;
      color: #fafafa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    h1 { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
    p { font-size: 14px; color: #a1a1aa; margin: 0 0 16px; max-width: 320px; }
    .fallback { background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px; max-width: 320px; }
    a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover { text-decoration: underline; }
    #openBtn {
      display: inline-block;
      margin-top: 8px;
      padding: 12px 20px;
      background: #10b981;
      color: #000;
      font-weight: 600;
      font-size: 14px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="fallback">
    <p style="margin:0;color:#fafafa;font-weight:600;">If you see code instead of a button:</p>
    <p style="margin:8px 0 0 0;">Copy the full address from your browser bar and open it in <strong>Safari</strong> or <strong>Chrome</strong>. Then you can reset your password.</p>
  </div>
  <h1>Opening Momentum</h1>
  <p id="msg">If the app didn't open, use the button below or open this link in Safari (or Chrome) and try again.</p>
  <a id="openLink" href="#">Open in Momentum</a>
  <button id="openBtn" type="button">Open in Momentum</button>
  <noscript>
    <p style="margin-top:16px;">JavaScript is off. Copy this page's URL from the address bar and open it in Safari or Chrome to reset your password.</p>
  </noscript>
  <script>
    (function() {
      var hash = window.location.hash || '';
      var appUrl = 'momentum://reset-password' + hash;
      if (hash.indexOf('access_token') !== -1) {
        window.location.replace(appUrl);
      }
      document.getElementById('openLink').href = appUrl;
      document.getElementById('openBtn').onclick = function() {
        window.location.href = appUrl;
      };
    })();
  </script>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const headers = new Headers();
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(HTML, {
    status: 200,
    headers,
  });
});
