import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || url.includes('placeholder')) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Please add it to your .env.local file.');
  }
  if (!key || key.includes('placeholder')) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Please add it to your .env.local file.');
  }
  
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function validateSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Please add it to your .env.local file.');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Please add it to your .env.local file.');
  }
}

