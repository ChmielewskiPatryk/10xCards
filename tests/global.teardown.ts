import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

teardown('clean up database', async () => {
  const testUserId = process.env.TEST_USER_ID;
  if (!testUserId) {
    throw new Error('TEST_USER_ID environment variable is not set');
  }

  // Initialize Supabase client
  const supabase = createClient<Database>(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_KEY!
  );

  console.log('Cleaning up test database...');
  
  try {
    // Delete all flashcards for the test user
    const { error: deleteError } = await supabase
      .from('flashcards')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.error('Error cleaning up flashcards:', deleteError);
      throw deleteError;
    }

    console.log('Successfully cleaned up test database');
  } catch (error) {
    console.error('Failed to clean up test database:', error);
    throw error;
  }
}); 