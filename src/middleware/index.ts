import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.server";

// Ścieżki publiczne - dostępne bez uwierzytelniania
const PUBLIC_PATHS = [
  // Strony uwierzytelniania
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  // Endpointy API uwierzytelniania
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Pomijaj sprawdzanie dla ścieżek publicznych
  if (PUBLIC_PATHS.includes(url.pathname)) {
    const supabase = createSupabaseServerClient({
      cookies,
      headers: request.headers,
    });
    locals.supabase = supabase;
    return next();
  }

  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  // WAŻNE: Zawsze pobieraj sesję użytkownika przed innymi operacjami
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Zapisz klienta w locals
  locals.supabase = supabase;

  if (user) {
    locals.user = {
      email: user.email,
      id: user.id,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname)) {
    // Przekieruj do logowania dla chronionych ścieżek
    return redirect("/auth/login");
  }

  return next();
});
