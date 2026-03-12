import {  gemini_model, createGeminiModel } from '@/lib/langchain'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser, StringOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { ResearchResult } from '../types'

const ResearchSchema = z.object({
  topics: z.array(z.string()).describe('3-5 key research topics'),
  findings: z.array(z.string()).describe('Research findings for each topic'),
  sources: z.array(z.string()).describe('Source URLs or references'),
})


const researchPrompt = PromptTemplate.fromTemplate(`
You are a professional research assistant for product and technical content teams.

Your job:
1. Read the PRD (Product Requirements Document)
2. Identify 3-5 key topics that need research
3. Simulate web-style research by generating realistic, up-to-date findings
4. Provide realistic-looking source URLs

You MUST return ONLY valid JSON in the following format:
{{
  "topics": ["topic1", "topic2", "topic3"],
  "findings": [
    "Finding 1 with context.",
    "Finding 2 with context.",
    "Finding 3 with context."
  ],
  "sources": ["url1", "url2", "url3"]
}}

Here is the PRD document:
{prd}

Generate the research results now. Output only JSON.
`)


const model = createGeminiModel()

// Create the chain
// const researchChain = RunnableSequence.from([
//   researchPrompt,
//   model,
//   stringParser,
//   outputParser,
// ])
const researchChain = researchPrompt
  .pipe(gemini_model)
  .pipe(new StringOutputParser())
  .pipe(new JsonOutputParser<{ topics: string[]; findings: string[]; sources: string[] }>())


export async function runResearcher(prompt: string): Promise<ResearchResult>{
  try{
    console.log(' Researcher agent starting (LangChain)...')


    const result = await researchChain.invoke({ prd: prompt })

    console.log(' Researcher completed')
    console.log(`   - Topics: ${result.topics.length}`)
    console.log(`   - Findings: ${result.findings.length}`)
    console.log(`   - Sources: ${result.sources.length}`)

    return {
      topics: result.topics || [],
      findings: result.findings || [],
      sources: result.sources || [],
      rawOutput: JSON.stringify(result, null, 2),
    }

  }catch(error){
    console.error('Error in Research agent: ', error);

    if (error instanceof Error){
      console.error(`Researcher agent failed: ${error.message}`);
    }
    throw error;
  }
}
