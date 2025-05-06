import type { APIRoute } from 'astro';
import { testOpenRouterService } from '../../lib/services/openrouter/test-command';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await testOpenRouterService();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'OpenRouter service test completed',
      result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error testing OpenRouter service:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 