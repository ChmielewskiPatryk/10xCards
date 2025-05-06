/**
 * Service for monitoring OpenRouter API usage
 * Tracks request counts and token usage by model
 */
export class OpenRouterMetrics {
  private static _instance: OpenRouterMetrics;
  private _requestCounts: Map<string, number> = new Map();
  private _tokenCounts: Map<string, { prompt: number, completion: number, total: number }> = new Map();
  
  private constructor() {}
  
  /**
   * Gets singleton instance of the metrics service
   */
  static getInstance(): OpenRouterMetrics {
    if (!OpenRouterMetrics._instance) {
      OpenRouterMetrics._instance = new OpenRouterMetrics();
    }
    return OpenRouterMetrics._instance;
  }
  
  /**
   * Logs a request to a specific AI model
   * @param model The model name
   */
  logRequest(model: string): void {
    const currentCount = this._requestCounts.get(model) || 0;
    this._requestCounts.set(model, currentCount + 1);
  }
  
  /**
   * Logs token usage for a specific model
   * @param model The model name
   * @param promptTokens Number of tokens in the prompt
   * @param completionTokens Number of tokens in the completion
   */
  logTokenUsage(model: string, promptTokens: number, completionTokens: number): void {
    const currentCount = this._tokenCounts.get(model) || { prompt: 0, completion: 0, total: 0 };
    this._tokenCounts.set(model, {
      prompt: currentCount.prompt + promptTokens,
      completion: currentCount.completion + completionTokens,
      total: currentCount.total + promptTokens + completionTokens
    });
  }
  
  /**
   * Returns statistics about API usage
   */
  getRequestStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [model, count] of this._requestCounts.entries()) {
      stats[model] = { requests: count };
      
      const tokenUsage = this._tokenCounts.get(model);
      if (tokenUsage) {
        stats[model].tokens = tokenUsage;
      }
    }
    
    return stats;
  }
  
  /**
   * Resets all usage statistics
   */
  resetStats(): void {
    this._requestCounts.clear();
    this._tokenCounts.clear();
  }
} 