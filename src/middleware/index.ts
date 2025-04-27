import type { MiddlewareHandler } from 'astro';

import { supabaseClient } from '../db/supabase.client';

export const onRequest: MiddlewareHandler = async ({ locals }, next) => {
  locals.supabase = supabaseClient;
  return await next();
}; 