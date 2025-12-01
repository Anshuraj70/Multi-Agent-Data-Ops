import { grok_model } from "@/lib/langchain";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { FactCheckResult } from "../types";

const factCheckerprompt = PromptTemplate.fromTemplate(`
You are an expert peer reviewer for a technical content team.

# Your Tasks:
1. Review the blog draft for factual accuracy against research findings
2. Identify inaccuracies, inconsistencies, or unsupported claims
3. Provide constructive feedback
4. Summarize findings clearly

# Blog Draft:
{draftContent}

# Research Findings (Source Material):
{researchFindings}

# Original PRD Context:
{prd}

Analyze the draft carefully and return ONLY JSON in this format:
{{
  "passed": true/false,
  "issues": ["issue1", "issue2"],
  "feedback": "constructive feedback here"
}}
`);


const outputParser = new JsonOutputParser<FactCheckResult>();

const factCheckerchain = RunnableSequence.from([
  factCheckerprompt,
  grok_model,
  outputParser,
]);

export async function factCheckerAgent(
  prompt: string,
  draftContent: string,
  researchFindings: string[]
): Promise<FactCheckResult> {
  try {
    console.log("Fact checker processing ...");
    const findingsFormatted = researchFindings
      .map((f, i) => `${i + 1}. ${f}`)
      .join('\n\n');

    const result = await factCheckerchain.invoke({
      draftContent: draftContent,
      researchFindings: findingsFormatted,
      prd: prompt  // Original PRD for context
    })
     console.log("✅ Fact checker completed");
    console.log(`   - Passed: ${result.passed}`);
    console.log(`   - Issues found: ${result.issues?.length || 0}`);

    return {
      passed: result.passed || false,
      issues: result.issues || [],
      feedback: result.feedback || "",
      rawOutput: JSON.stringify(result, null, 2),
    }

  } catch (error) {
    console.error("❌ Fact checker error:", error);
    throw error;
  }
}