import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://hitmhxjcgllpclsbxtdd.supabase.co';

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdG1oeGpjZ2xscGNsc2J4dGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDg4MTEsImV4cCI6MjA4MzMyNDgxMX0._ULPxDFNNvkzoQqDNM6Uaz2zETxUQaaQSgcsECKBtnU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});




