import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';


const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Default user ID for development purposes
export const DEFAULT_USER_ID = 'a2ff3fac-c997-4edf-aba4-5092242fd92f';

// OpenRouter API settings
export const openRouterApiKey = import.meta.env.PUBLIC_OPENROUTER_API_KEY || '';
export const openRouterUrl = 'https://openrouter.ai/api/v1';

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
}); 