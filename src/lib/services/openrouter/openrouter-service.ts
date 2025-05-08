import type { 
    OpenRouterServiceConfig,
    OpenRouterRequest,
    OpenRouterMessage,
    ChatOptions,
    StreamChatOptions,
    ChatResponse
  } from './types';
  import { OpenRouterMetrics } from './openrouter-metrics';
  import { openRouterApiKey, openRouterUrl } from '@/db/supabase.client';
  
  /**
   * Service for communicating with AI models via OpenRouter.ai
   * Provides a unified interface for different AI model providers
   */
  export class OpenRouterService {
    private _apiKey: string;
    private _defaultModel: string;
    private _baseURL: string;
    private _defaultParams: Partial<Omit<OpenRouterRequest, 'messages' | 'model'>>;
    private _timeout: number;
    private _metrics: OpenRouterMetrics;
  
    /**
     * Creates a new instance of OpenRouterService
     * @param config Configuration options for the service
     */
    constructor({
      apiKey = openRouterApiKey,
      defaultModel = 'anthropic/claude-3-haiku',
      baseURL = openRouterUrl,
      defaultParams = {},
      timeout = 30000
    }: OpenRouterServiceConfig) {
      // Don't throw an error for empty API key to allow for initialization with environment variables
      // that might be loaded later or for using mock responses
      this._apiKey = apiKey || '';
      this._defaultModel = defaultModel;
      this._baseURL = baseURL || 'https://openrouter.ai/api/v1';
      this._defaultParams = defaultParams;
      this._timeout = timeout;
      this._metrics = OpenRouterMetrics.getInstance();
    }
  
    /**
     * Sends a chat request to the AI model
     * @param options Chat options including messages and model parameters
     * @returns Chat response with content and usage statistics
     */
    async chat({
      messages,
      model = this._defaultModel,
      responseFormat,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty
    }: ChatOptions): Promise<ChatResponse> {
      try {
        // Check API key before making the request
        if (!this._apiKey) {
          throw new Error('API key is required for OpenRouter API calls');
        }
  
        // Validate parameters
        this._validateParams({ messages, model });
        
        // Format messages
        const formattedMessages = this._formatMessages(messages);
        
        // Prepare request options
        const requestOptions = this._buildRequestOptions({
          messages: formattedMessages,
          model,
          response_format: responseFormat,
          temperature,
          max_tokens,
          top_p,
          frequency_penalty,
          presence_penalty
        });
        
        // Execute request
        const response = await fetch(`${this._baseURL}/chat/completions`, requestOptions);
        
        // Handle HTTP errors
        if (!response.ok) {
          throw await this._handleError(response);
        }
        
        // Process response
        const data = await response.json();
        const result = this._handleResponse(data);
        
        // Log metrics
        this._metrics.logRequest(result.model);
        if (result.usage) {
          this._metrics.logTokenUsage(
            result.model,
            result.usage.prompt_tokens,
            result.usage.completion_tokens
          );
        }
        
        return result;
      } catch (error) {
        // Error handling
        throw this._handleError(error);
      }
    }
  
    /**
     * Streams a chat response from the AI model
     * @param options Chat options including messages, model parameters, and handlers for messages and errors
     */
    async streamChat({
      messages,
      model = this._defaultModel,
      responseFormat,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      onMessage,
      onError
    }: StreamChatOptions): Promise<void> {
      try {
        // Check API key before making the request
        if (!this._apiKey) {
          throw new Error('API key is required for OpenRouter API calls');
        }
  
        // Validate parameters
        this._validateParams({ messages, model });
        
        // Format messages
        const formattedMessages = this._formatMessages(messages);
        
        // Prepare request options
        const requestOptions = this._buildRequestOptions({
          messages: formattedMessages,
          model,
          response_format: responseFormat,
          temperature,
          max_tokens,
          top_p,
          frequency_penalty,
          presence_penalty,
          stream: true
        });
        
        // Execute streaming request
        const response = await fetch(`${this._baseURL}/chat/completions`, requestOptions);
        
        // Log the request
        this._metrics.logRequest(model);
        
        // Handle HTTP errors
        if (!response.ok) {
          const error = await this._handleError(response);
          onError(error);
          return;
        }
        
        // Process the stream
        const reader = response.body?.getReader();
        if (!reader) {
          onError(new Error('Stream reader not available'));
          return;
        }
        
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                onMessage(parsed);
              } catch (e) {
                // Ignore invalid data
                console.warn('Error parsing SSE message:', e);
              }
            }
          }
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  
    /**
     * Get current usage statistics
     */
    getUsageStats(): Record<string, any> {
      return this._metrics.getRequestStats();
    }
  
    /**
     * Check if the service is configured with an API key
     */
    isConfigured(): boolean {
      return Boolean(this._apiKey);
    }
  
    // Private helper methods
  
    /**
     * Formats messages to ensure they have the correct structure
     */
    private _formatMessages(messages: OpenRouterMessage[]): OpenRouterMessage[] {
      return messages.map(message => ({
        role: message.role,
        content: message.content
      }));
    }
    
    /**
     * Validates required parameters before sending the request
     */
    private _validateParams({ messages, model }: { messages: OpenRouterMessage[], model: string }): void {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error('Messages array cannot be empty');
      }
      
      if (!model) {
        throw new Error('Model must be specified');
      }
    }
    
    /**
     * Builds HTTP request options with proper headers and body
     */
    private _buildRequestOptions(params: OpenRouterRequest): RequestInit {
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://api.yourdomain.com',
        'X-Title': typeof document !== 'undefined' ? document.title : 'API Request'
      });
  
      return {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...this._defaultParams,
          ...params
        }),
        signal: AbortSignal.timeout(this._timeout)
      };
    }
    
    /**
     * Handles error responses and converts them to appropriate Error objects
     */
    private async _handleError(error: Response | any): Promise<Error> {
      // Log error details for easier debugging
      console.error("OpenRouter API error details:", error);
      
      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          const message = errorData.error || `HTTP error ${error.status}`;
          
          if (error.status === 401) {
            return new Error('API key is invalid or expired');
          } else if (error.status === 429) {
            return new Error('Rate limit exceeded. Please try again later');
          } else if (error.status === 400) {
            return new Error(`Bad request: ${message}`);
          } else if (error.status >= 500) {
            return new Error(`Server error: ${message}`);
          } else {
            return new Error(message);
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
          return new Error(`HTTP error ${error.status}`);
        }
      }
      
      // Better handling of different error object types
      if (error && typeof error === 'object') {
        if (error.message) {
          return new Error(error.message);
        } else if (error.error) {
          return new Error(typeof error.error === 'string' 
            ? error.error 
            : JSON.stringify(error.error));
        } else {
          // Try to extract meaningful information from the error object
          try {
            return new Error(JSON.stringify(error));
          } catch (e) {
            return new Error('Unknown error occurred');
          }
        }
      }
      
      return error instanceof Error ? error : new Error(String(error));
    }
    
    /**
     * Processes the API response and extracts relevant data
     */
    private _handleResponse(data: any): ChatResponse {
      // Extract necessary data from API response
      return {
        id: data.id,
        model: data.model,
        created: data.created,
        content: data.choices[0]?.message?.content || '',
        usage: data.usage
      };
    }
  }
  
  // Create and export a singleton instance with default configuration
  export const openRouterService = new OpenRouterService({
    apiKey: openRouterApiKey || '',
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3-haiku',
    baseURL: openRouterUrl || ''
  }); 