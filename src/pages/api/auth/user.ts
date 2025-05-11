import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          authenticated: false,
          user: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: locals.user,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error getting user data:", err);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        authenticated: false,
        user: null,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
