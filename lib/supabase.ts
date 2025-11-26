import { createClient } from '@supabase/supabase-js';

// Use placeholder values during build, validate at runtime
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Runtime validation (only in API routes and server components)
export function validateSupabaseConfig() {
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
    throw new Error('Missing SUPABASE_URL. Please add it to your .env.local file.');
  }
  if (!process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY.includes('placeholder')) {
    throw new Error('Missing SUPABASE_ANON_KEY. Please add it to your .env.local file.');
  }
}

