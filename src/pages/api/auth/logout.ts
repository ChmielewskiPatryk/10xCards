import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const supabase = createSupabaseServerClient({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Błąd wylogowania:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd podczas wylogowania",
      }),
      { status: 500 }
    );
  }
};
