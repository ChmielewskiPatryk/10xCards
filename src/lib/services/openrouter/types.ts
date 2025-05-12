// Types for OpenRouter API
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, any>;
  };
}

export interface OpenRouterRequest {
  messages: OpenRouterMessage[];
  model: string;
  response_format?: OpenRouterResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenRouterServiceConfig {
  apiKey: string;
  defaultModel?: string;
  baseURL?: string;
  defaultParams?: Partial<Omit<OpenRouterRequest, "messages" | "model">>;
  timeout?: number;
}

export interface ChatOptions extends Omit<OpenRouterRequest, "response_format" | "stream"> {
  responseFormat?: OpenRouterResponseFormat;
}

export interface StreamChatOptions extends Omit<ChatOptions, "onMessage" | "onError"> {
  onMessage: (message: any) => void;
  onError: (error: Error) => void;
}

export interface ChatResponse {
  id: string;
  model: string;
  created: number;
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
