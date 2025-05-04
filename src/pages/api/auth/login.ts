import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../db/supabase.server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerClient({ 
      cookies, 
      headers: request.headers 
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }), 
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: data.user 
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Błąd logowania:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Wystąpił błąd podczas logowania' 
      }), 
      { status: 500 }
    );
  }
}; 