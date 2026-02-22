# auth-redirect

Serves the password reset (and optional signup) redirect bridge page so email links open a real page instead of a blank one in in-app browsers. The page then redirects to `momentum://reset-password` with the token hash.

## Production setup

In [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration), add this URL to **Redirect URLs**:

- `https://<your-project-ref>.supabase.co/functions/v1/auth-redirect`

Replace `<your-project-ref>` with your project reference (same as in `EXPO_PUBLIC_SUPABASE_URL`). Keep `momentum://**` in the list if you use it for direct deep links.

## Deploy

The function must be **public** (no JWT required) so the email redirect can load it without an Authorization header:

```bash
supabase functions deploy auth-redirect --no-verify-jwt
```

If you use `[functions.auth-redirect] verify_jwt = false` in `supabase/config.toml`, the flag may still be needed for deployed functions depending on your CLI version.
