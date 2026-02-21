import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View } from 'react-native';
import { colors } from '../lib/theme';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.base }} />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
