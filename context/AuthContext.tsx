import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/database.types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthState | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export function AuthProvider({ children, queryClient }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
        queryClient.clear();
        router.replace('/(auth)/login');
      } else if (session?.user) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data);
      } else {
        // No profile found — session is stale (e.g. user was deleted from dashboard).
        // Sign out to clear cached tokens so the user lands on the login screen.
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (e) {
      return { error: e as AuthError };
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: 'momentum://login' },
      });
      if (error) return { error };
      const needsConfirmation = !data.session && !!data.user;
      return { error: null, needsConfirmation };
    } catch (e) {
      return { error: e as AuthError };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPassword(email: string) {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
      const redirectTo =
        supabaseUrl.startsWith('https://')
          ? `${supabaseUrl}/functions/v1/auth-redirect`
          : 'momentum://reset-password';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      return { error };
    } catch (e) {
      return { error: e as AuthError };
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
    } catch (e) {
      return { error: e as AuthError };
    }
  }

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
