import { openRouterService } from './openrouter-service';

/**
 * Simple test command to verify the OpenRouter service is properly configured and working
 */
export async function testOpenRouterService() {
  console.log('Testing OpenRouter service...');
  
  if (!openRouterService.isConfigured()) {
    console.error('OpenRouter service is not configured with an API key');
    return {
      success: false,
      error: 'API key not configured'
    };
  }
  
  try {
    const response = await openRouterService.chat({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Hello! Please respond with a simple greeting to test the API connection.'
        }
      ],
      model: 'anthropic/claude-3-haiku', // Using a smaller, cheaper model for testing
      max_tokens: 100
    });
    
    console.log('OpenRouter test successful!');
    console.log('Model used:', response.model);
    console.log('Response:', response.content);
    
    return {
      success: true,
      model: response.model,
      content: response.content,
      tokens: response.usage
    };
  } catch (error) {
    console.error('OpenRouter test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 