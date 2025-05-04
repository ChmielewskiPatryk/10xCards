import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../db/supabase.server';

export const prerender = false;

// Validate registration payload
const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę')
    .regex(/[^A-Za-z0-9]/, 'Hasło musi zawierać co najmniej jeden znak specjalny'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Hasła nie są identyczne',
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      return new Response(
        JSON.stringify({ success: false, errors }),
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { status: 201 }
    );
  } catch (err) {
    console.error('Błąd rejestracji:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Wystąpił błąd podczas rejestracji' }),
      { status: 500 }
    );
  }
}; 