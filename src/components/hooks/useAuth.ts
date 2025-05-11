import { useState, useEffect } from "react";
import { supabaseClient } from "../../db/supabase.client";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      } else {
        setUser(session?.user ?? null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Wywołaj API endpoint wylogowania, które obsługuje sesję po stronie serwera
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Błąd wylogowania");
      }

      // Następnie wyczyść sesję po stronie klienta
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;

      // Redirect to login page
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  };

  return { user, isLoading, error, signOut };
};

export default useAuth;
