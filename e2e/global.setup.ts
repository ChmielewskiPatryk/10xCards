import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

setup("initialize test database", async () => {
  const testUserId = process.env.E2E_USERNAME_ID;
  if (!testUserId) {
    throw new Error("TEST_USER_ID environment variable is not set");
  }

  // Check for required environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not set");
  }

  // Initialize Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  console.log("Initializing test database...");

  try {
    // First clean up any existing data for this test user
    const { error: deleteError } = await supabase.from("flashcards").delete().eq("user_id", testUserId);

    if (deleteError) {
      console.error("Error cleaning up existing data:", deleteError);
      throw deleteError;
    }

    console.log("Successfully initialized test database");
  } catch (error) {
    console.error("Failed to initialize test database:", error);
    throw error;
  }
});
