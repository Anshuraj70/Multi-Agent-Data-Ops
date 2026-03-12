import { ChatGoogle } from "@langchain/google";

export const gemini_model = new ChatGoogle({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 4000,
})

export function createGeminiModel(config?: {
  temperature?: number
  maxTokens?: number
}) {
  return new ChatGoogle({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: config?.temperature ?? 0.7,
    maxOutputTokens: config?.maxTokens ?? 2000,
  })
}