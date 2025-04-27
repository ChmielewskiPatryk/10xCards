import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';


const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Default user ID for development purposes
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// OpenRouter API settings
export const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY || '';
export const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 