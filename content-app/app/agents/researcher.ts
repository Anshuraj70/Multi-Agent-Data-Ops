import { xai } from '@ai-sdk/xai'
import { generateText } from 'ai'

export interface ResearchResult {
  topics: string[]
  findings: string[]
  sources: string[]
  rawOutput: string
}

export async function runResearcher(prdText: string): Promise<ResearchResult> {
  try {
    console.log(' Researcher agent starting .....')

    const result = await generateText({
      model: xai('grok-beta'),
      system: `You are a professional research assistant for product and technical content teams.

Your job:
1. Read the PRD (Product Requirements Document)
2. Identify 3–5 key topics that need research
3. Simulate web-style research by generating realistic, up-to-date findings
4. Provide realistic-looking source URLs

You MUST return ONLY valid JSON in the following format:
{
  "topics": ["topic1", "topic2", "topic3"],
  "findings": [
    "Finding 1 with context.",
    "Finding 2 with context.",
    "Finding 3 with context."
  ],
  "sources": ["url1", "url2", "url3"]
}`,

      prompt: `Here is the PRD document:

${prdText}

Generate the research results now. Output only JSON.`,
    })

    if (!result.text || result.text.trim().length === 0) {
      throw new Error("Agent returned no final output")
    }

    const output = result.text

    console.log(" Researcher completed")
    console.log("Raw output:", output)

    let parsed: ResearchResult

    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0])

        parsed = {
          topics: jsonData.topics || [],
          findings: jsonData.findings || [],
          sources: jsonData.sources || [],
          rawOutput: output
        }
      } else {
        parsed = {
          topics: ["General research"],
          findings: [output],
          sources: [],
          rawOutput: output
        }
      }
    } catch (parseError) {
      console.error(" Failed to parse JSON, using raw output")

      parsed = {
        topics: ["Research completed"],
        findings: [output],
        sources: [],
        rawOutput: output
      }
    }

    return parsed
  } catch (error) {
    console.error(" Researcher agent error:", error)
    throw error
  }
}
