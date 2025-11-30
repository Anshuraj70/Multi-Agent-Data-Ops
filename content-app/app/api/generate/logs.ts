import { createPost, updatePost, logAgentAction } from "@/lib/supabase/queries";
import { WriterResult, FactCheckResult, ResearchResult, PolishedResult } from "@/app/types";

export async function writerlogs(
  writeresult: WriterResult,
  researchresult: ResearchResult,
  runId: string
) {
  await logAgentAction({
    agent: "writer",
    input: researchresult.rawOutput.substring(0, 500),
    output: JSON.stringify(writeresult),
    run_id: runId,
    status: "success",
    metadata: {
      wordCount: writeresult.wordCount,
      sectionsCount: writeresult.sectionsCount,
    },
  });
  console.log("Writer logs are saved.");
  await updatePost(runId, {
    final_content: writeresult.draft,
    status: "completed",
    scores: {
      research_quality:
        researchresult.topics.length >= 3 ? "good" : "needs_improvement",
      word_count: writeresult.wordCount,
      sections_count: writeresult.sectionsCount,
    },
  });
}

export async function factCheckerlogAgentAction( writeresult: WriterResult, reviewreport: FactCheckResult, runId: string) {
    await logAgentAction({
      agent: "fact_checker",
      input: JSON.stringify({
        originalDraft: writeresult.draft.substring(0, 200),
        issues: reviewreport.issues,
      }),
      output: JSON.stringify(reviewreport),
      run_id: runId,
      status: "success",
      metadata: {
        originalWordCount: writeresult.wordCount,
        newWordCount: writeresult.wordCount,
        issuesCorrected: reviewreport.issues.length,
      },
    });
}

export async function stylepolisherlog ( writerResult: WriterResult, polishedResult: PolishedResult, runId: string) {
  await logAgentAction({
    agent: "style-polisher",
    input: writerResult.draft.substring(0, 200),
    output: polishedResult.content.substring(0, 200),
    run_id: runId,
    status: "success",
    metadata: {
      originalWordCount: writerResult.wordCount,
      newWordCount: polishedResult.content.trim().split(/\s+/).length,
    },
  });
}


