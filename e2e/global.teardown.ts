import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("cleanup test database", async () => {
  const testUserId = process.env.E2E_USERNAME_ID;
  if (!testUserId) {
    throw new Error("E2E_USERNAME_ID environment variable is not set");
  }

  // Check for required environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not set");
  }

  // Initialize Supabase client with service role key
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("Cleaning up test database...");

  try {
    // Clean up all data for this test user
    const { error: deleteError } = await supabase.from("flashcards").delete().eq("user_id", testUserId);

    if (deleteError) {
      console.error("Error cleaning up test data:", deleteError);
      throw deleteError;
    }

    console.log("Successfully cleaned up test database");
  } catch (error) {
    console.error("Failed to clean up test database:", error);
    throw error;
  }
});
