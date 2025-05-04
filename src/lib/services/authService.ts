import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';

/**
 * Registers a new user with Supabase Auth
 */
export async function registerUser(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

/**
 * Signs in a user with Supabase Auth
 */
export async function loginUser(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
} 