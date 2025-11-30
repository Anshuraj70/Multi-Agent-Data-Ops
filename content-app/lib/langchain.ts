import { ChatOpenAI } from '@langchain/openai';

export const grok_model = new ChatOpenAI({
    modelName: 'grok-beta',
    openAIApiKey: process.env.XAI_API_KEY,
    configuration:{
        baseURL: process.env.XAI_API_BASE_URL || "https://api.x.ai/v1",
    },
    temperature: 0.7,
    maxTokens: 4000,
});

export function createGrokModel(config?: {
  temperature?: number
  maxTokens?: number
  modelName?: string
}) {
  return new ChatOpenAI({
    modelName: config?.modelName || 'grok-beta',
    openAIApiKey: process.env.XAI_API_KEY,
    configuration: {
      baseURL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
    },
    temperature: config?.temperature ?? 0.7,
    maxTokens: config?.maxTokens ?? 2000,
  })
}