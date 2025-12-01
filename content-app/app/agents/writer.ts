import { grok_model } from "@/lib/langchain";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ResearchResult, WriterResult } from "../types";

const writerPrompt = PromptTemplate.fromTemplate(`
You are an expert blog writer for a technical content team.

Your task:
1. Write a comprehensive, engaging blog post based on the PRD and research
2. Structure: Title → Introduction → Main Content (multiple sections) → Conclusion
3. Incorporate ALL research findings naturally into the content
4. Use markdown formatting (headers, lists, bold, etc.)
5. Write in a professional yet accessible tone
6. Aim for 800-1200 words

The blog should educate readers about the product while being engaging and well-researched.

# Product Requirements Document (PRD)
{prd}

---

# Research Materials

**Key Topics:**
{topics}

**Research Findings:**
{findings}

{sources}

---

Write a complete blog post that:
- Starts with an engaging title and introduction
- Covers all key topics from the research
- Incorporates the findings naturally
- Ends with a compelling conclusion
- Uses proper markdown formatting

Begin writing now:
`);

const editorprompt = PromptTemplate.fromTemplate(`
  You are an expert technical editor for a content team.

You've been given a blog draft with factual issues identified by fact-checkers.

# Original Blog Draft:
{oldDraft}

# Issues to Correct:
{issuesList}

# Your Task:
1. Carefully read each issue
2. Correct the factual errors in the draft
3. Maintain the same writing style and tone
4. Keep the overall structure intact
5. Ensure all corrections are accurate

Return the fully corrected blog draft (no JSON, just the corrected text):
`);

const outputParser = new StringOutputParser();

const editorchain = RunnableSequence.from([
  editorprompt,
  grok_model,
  outputParser,
]);

const writerChain = RunnableSequence.from([
  writerPrompt,
  grok_model,
  outputParser,
]);

export async function correctIssuesInDraft(
  oldDraft: string,
  issuesList: string[]
): Promise<{
  rewrittenDraft: string;
  wordcount: number;
  sectionscount: number;
  rawOutput: string;
}> {
  try {
    console.log(" Writer (editor) correcting issues...");
    const draft = await editorchain.invoke({
      oldDraft: oldDraft,
      issuesList: issuesList,
    });

    const wordCount = draft.trim().split(/\s+/).length;
    const sectionsCount = (draft.match(/^#{1,3}\s+/gm) || []).length;

    console.log(" Writer completed");
    console.log(`   - Words: ${wordCount}`);
    console.log(`   - Sections: ${sectionsCount}`);

    return {
      rewrittenDraft: draft,
      wordcount: wordCount,
      sectionscount: sectionsCount,
      rawOutput: draft,
    };
  } catch (error) {
    console.error(" Writer (editor) error:", error);
    throw error;
  }
}

export async function runWriter(
  prdText: string,
  research: ResearchResult
): Promise<WriterResult> {
  try {
    console.log("Writer agent starting (LangChain)...");
    console.log(`Topics to cover: ${research.topics.length}`);
    console.log(`Findings to incorporate: ${research.findings.length}`);

    // Format research for the prompt
    const topicsFormatted = research.topics
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    const findingsFormatted = research.findings
      .map((f, i) => `${i + 1}. ${f}`)
      .join("\n\n");

    const sourcesFormatted =
      research.sources.length > 0
        ? `**Sources:**\n${research.sources
            .map((s, i) => `${i + 1}. ${s}`)
            .join("\n")}`
        : "";

    const draft = await writerChain.invoke({
      prd: prdText,
      topics: topicsFormatted,
      findings: findingsFormatted,
      sources: sourcesFormatted,
    });

    const wordCount = draft.trim().split(/\s+/).length;
    const sectionsCount = (draft.match(/^#{1,3}\s+/gm) || []).length;

    console.log(" Writer completed");
    console.log(`   - Words: ${wordCount}`);
    console.log(`   - Sections: ${sectionsCount}`);

    return {
      draft,
      wordCount,
      sectionsCount,
      rawOutput: draft,
    };
  } catch (error) {
    console.error(" Writer agent error:", error);
    throw error;
  }
}
