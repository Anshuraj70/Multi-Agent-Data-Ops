// import { Agent, run } from "@openai/agents";
// import { webSearchTool } from '@openai/agents/tools'
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export interface ResearchResult {
  topics: string[];
  findings: string[];
  sources: string[];
  rawOutput: string;
}

export async function runResearcher(prdText: string): Promise<ResearchResult> {
  try {
    // Create the researcher agent
    //     const agent = new Agent({
    //       name: "Researcher",
    //       model: "gpt-4o-mini", // or "gpt-4o" for cheaper
    //       instructions: `You are a research assistant for product development.

    // Your task:
    // 1. Read the PRD (Product Requirements Document)
    // 2. Identify 3-5 key topics that need research
    // 3. Use web search to find relevant, current information
    // 4. Compile findings with sources

    // Output format (JSON):
    // {
    //   "topics": ["topic1", "topic2", "topic3"],
    //   "findings": [
    //     "Finding 1 with context...",
    //     "Finding 2 with context...",
    //     "Finding 3 with context..."
    //   ],
    //   "sources": ["url1", "url2", "url3"]
    // }

    // Return ONLY valid JSON.`,
    //       //   tools: [webSearchTool()], // Enable web search capability
    //     });
const ai = new GoogleGenAI({});

    const result = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are a research assistant for product development.

Your task:
1. Read the PRD (Product Requirements Document)
2. Identify 3-5 key topics that need research
3. Use web search to find relevant, current information
4. Compile findings with sources

Output format (JSON):
{
  "topics": ["topic1", "topic2", "topic3"],
  "findings": [
    "Finding 1 with context...",
    "Finding 2 with context...",
    "Finding 3 with context..."
  ],
  "sources": ["url1", "url2", "url3"]
}

Return ONLY valid JSON.`,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      }
    },
  });


    if (!result.text || result.text.trim().length === 0) {
      throw new Error("Agent returned no final output");
    }

    const output = result.text;

    console.log(" Researcher completed");
    console.log("Raw output:", output);

    // Parse the structured output
    let parsed: ResearchResult;
    try {
      // The agent should return JSON based on our instructions
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        parsed = {
          topics: jsonData.topics || [],
          findings: jsonData.findings || [],
          sources: jsonData.sources || [],
          rawOutput: output,
        };
      } else {
        // Fallback if not JSON
        parsed = {
          topics: ["General research"],
          findings: [output],
          sources: [],
          rawOutput: output,
        };
      }
    } catch (parseError) {
      console.error(" Failed to parse JSON, using raw output");
      parsed = {
        topics: ["Research completed"],
        findings: [output],
        sources: [],
        rawOutput: output,
      };
    }

    return parsed;
  } catch (error) {
    console.error(" Researcher agent error:", error);
    throw error;
  }
}
