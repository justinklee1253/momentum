import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const CHUNK_SIZE = 2048;

// Chunked SecureStore adapter: splits values that exceed SecureStore's ~2KB per-key
// limit across multiple keys so the full Supabase session can be persisted safely.
const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const sizeStr = await SecureStore.getItemAsync(`${key}_size`);
    if (sizeStr) {
      const count = parseInt(sizeStr, 10);
      const chunks: string[] = [];
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (chunk === null) return null;
        chunks.push(chunk);
      }
      return chunks.join('');
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    // Clean up any previous chunked data for this key
    const prevSize = await SecureStore.getItemAsync(`${key}_size`);
    if (prevSize) {
      const count = parseInt(prevSize, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_size`);
    }

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(
        `${key}_chunk_${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
    await SecureStore.setItemAsync(`${key}_size`, String(count));
    // Remove the non-chunked key if it existed from a previous non-chunked write
    await SecureStore.deleteItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    const sizeStr = await SecureStore.getItemAsync(`${key}_size`);
    if (sizeStr) {
      const count = parseInt(sizeStr, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_size`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Creates a session from a Supabase auth redirect URL (e.g. password reset link).
 * Expects URL with hash fragment: #access_token=...&refresh_token=...&type=recovery
 */
export async function createSessionFromUrl(url: string): Promise<{ error: Error | null }> {
  try {
    const hash = url.split('#')[1];
    if (!hash) return { error: new Error('No token in URL') };
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) return { error: new Error('Missing access_token or refresh_token') };
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    return { error };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
