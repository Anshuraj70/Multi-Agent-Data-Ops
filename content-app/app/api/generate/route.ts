import { NextRequest, NextResponse } from "next/server";
import { createPost, updatePost, logAgentAction } from "@/lib/supabase/queries";
import { writerlogs, factCheckerlogAgentAction, stylepolisherlog } from "./logs";
import { runResearcher } from "@/app/agents/researcher";
import { runWriter, correctIssuesInDraft } from "@/app/agents/writer";
import { factCheckerAgent } from "@/app/agents/factChecker";
import { stylePolisherAgent } from "@/app/agents/stylePolisher";
import { string } from "zod/v4";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, runId } = body;

    if (!prompt || !runId) {
      return NextResponse.json(
        { error: "Missing prompt or runid" },
        { status: 400 }
      );
    }

    await createPost({
      prd_text: prompt,
      run_id: runId,
      status: "processing",
    });

    const researchResult = await runResearcher(prompt);

    console.log(" Research completed");
    console.log(`   - Topics: ${researchResult.topics.length}`);
    console.log(`   - Findings: ${researchResult.findings.length}`);
    console.log(`   - Sources: ${researchResult.sources.length}`);

    await logAgentAction({
      agent: "researcher",
      input: prompt.substring(0, 500),
      output: JSON.stringify(researchResult),
      run_id: runId,
      status: "success",
      metadata: {
        topicsCount: researchResult.topics.length,
        findingsCount: researchResult.findings.length,
        sourcesCount: researchResult.sources.length,
      },
    });

    console.log("Researcher logs are saved.");

    console.log("Starting Writer agent .....");
    const writeresult = await runWriter(prompt, researchResult);

    console.log(`Writer completed.`);
    console.log(`Word Count: ${writeresult.wordCount}`);
    console.log(`Sections Count: ${writeresult.sectionsCount}`);

    writerlogs(writeresult, researchResult, runId);

    // Starting Fact-Checker Agent
    console.log(" STEP 3: Initialising fact checker.....");
    let finalDraft = writeresult.draft;
    let finalWordCount = writeresult.wordCount;
    let finalSectionsCount = writeresult.sectionsCount;
    let factCheckAttempts = 1;
    const reviewreport = await factCheckerAgent(
      prompt,
      writeresult.draft,
      researchResult.findings
    );
    console.log("Fact checker completed.");
//If fact-check fails, attempt to correct issues once
    if (!reviewreport.passed) {
      console.log("Fact check failed. Issues found:");

      factCheckerlogAgentAction(writeresult, reviewreport, runId);
      factCheckAttempts += 1;
      console.log(`Issues: ${reviewreport.issues.join("; ")}`);
      console.log("Attempting to correct issues in the draft...");
      const rewrite = await correctIssuesInDraft(
        writeresult.draft,
        reviewreport.issues
      );
      const reviewport = await factCheckerAgent(
        prompt,
        rewrite.rewrittenDraft,
        researchResult.findings
      );
      if (JSON.stringify(reviewport).includes("Passed: True")) {
        console.log("Revised draft passed fact-check.");
        writeresult.draft = rewrite.rewrittenDraft;
        writeresult.wordCount = rewrite.wordcount;
        writeresult.sectionsCount = rewrite.sectionscount;
      }
      writerlogs(writeresult, researchResult, runId);
    }

    factCheckerlogAgentAction(writeresult, reviewreport, runId);

    const polishedtext = await stylePolisherAgent(writeresult.draft, prompt);
    finalDraft = polishedtext.content;
    stylepolisherlog(writeresult, polishedtext, runId);

    finalWordCount =  polishedtext.content.trim().split(/\s+/).length;
    finalSectionsCount = (polishedtext.content.match(/^#{1,3}\s+/gm) || []).length;


    

    console.log(" Style polishing completed.");

    await updatePost(runId, {
      final_content: finalDraft,
      status: "completed",
      scores: {
        research_quality:
          researchResult.topics.length >= 3 ? "good" : "needs_improvement",
        word_count: finalWordCount,
        sections_count: finalSectionsCount,
        fact_check_passed: reviewreport.passed || false,
        fact_check_attempts: factCheckAttempts,
      },
    });

    return NextResponse.json({
      success: true,
      runId,
      finalContent: finalDraft,
      pipeline: {
        research: {
          topics: researchResult.topics,
          findingsCount: researchResult.findings.length,
          sourcesCount: researchResult.sources.length,
        },
        writer: {
          wordCount: finalWordCount,
          sectionsCount: finalSectionsCount,
        },
        factCheck: {
          passed: reviewreport.passed,
          attempts: factCheckAttempts,
          issuesFound: reviewreport.issues.length,
        },
        polisher: {
          finalwordCount: finalWordCount,
          finalsectionsCount: finalSectionsCount,
          improvementsMade: polishedtext.improvements?.length || 0,
        },
      },
      metrics: {
        agentsRun: factCheckAttempts === 2 ? 5 : 4, // researcher + writer + fact_checker (+ optional revision)
        totalWordCount: finalWordCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in pipeline:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
