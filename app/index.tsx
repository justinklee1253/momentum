import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '../hooks/useAuth';
import { createSessionFromUrl } from '../lib/supabase';
import { View } from 'react-native';
import { colors } from '../lib/theme';

export default function Index() {
  const { session, profile, loading } = useAuth();
  const [pendingResetUrl, setPendingResetUrl] = useState<string | null>(null);

  // When app opens from password-reset link, create session then send user to reset-password screen
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    Linking.getInitialURL().then(async (url) => {
      if (cancelled || !url || !url.includes('reset-password') || !url.includes('access_token')) return;
      const { error } = await createSessionFromUrl(url);
      if (!cancelled && !error) setPendingResetUrl(url);
    });
    return () => { cancelled = true; };
  }, [loading]);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.base }} />;
  }

  if (pendingResetUrl) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
