import { supabaseClient } from '../../db/supabase.client';

/**
 * Service for logging errors and events
 */
export class LoggerService {
  /**
   * Log error to the system_logs table
   * @param userId User ID associated with the error
   * @param errorCode Error code for categorization
   * @param errorMessage Detailed error message
   * @param model Optional model name (e.g., AI model)
   */
  async logError(userId: string, errorCode: string, errorMessage: string, model?: string) {
    try {
      await supabaseClient.from('system_logs').insert({
        user_id: userId,
        error_code: errorCode,
        error_message: errorMessage,
        model: model
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Export a singleton instance
export const loggerService = new LoggerService(); 