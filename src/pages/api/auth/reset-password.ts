import { createClient } from '../../../db/client';
import type { APIRoute } from 'astro';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate request
    const data = await request.json();
    const result = resetPasswordSchema.safeParse(data);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Nieprawidłowe dane', 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }

    const { email } = result.data;
    
    // Create Supabase client
    const supabase = createClient();
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.SITE}/auth/reset-confirm`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      return new Response(
        JSON.stringify({ error: 'Wystąpił błąd podczas resetowania hasła' }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error in reset password endpoint:', err);
    return new Response(
      JSON.stringify({ error: 'Wystąpił nieoczekiwany błąd' }),
      { status: 500 }
    );
  }
}

export const prerender = false; 