import { NextRequest, NextResponse } from "next/server";
import { createPost, updatePost, logAgentAction } from "@/lib/supabase/queries";
import { runResearcher } from "@/app/agents/researcher";
import { writeNotesAgent } from "@/app/agents/writer";

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

    console.log(' Research completed')
    console.log(`   - Topics: ${researchResult.topics.length}`)
    console.log(`   - Findings: ${researchResult.findings.length}`)
    console.log(`   - Sources: ${researchResult.sources.length}`)

    await logAgentAction({
      agent: 'researcher',
      input: prompt.substring(0, 500),
      output: JSON.stringify(researchResult),
      run_id: runId,
      status: 'success',
      metadata: {
        topicsCount: researchResult.topics.length,
        findingsCount: researchResult.findings.length,
        sourcesCount: researchResult.sources.length
      }
    })

    console.log("Researcher logs are saved.")


    console.log("Starting Writer agent .....")
    const writeresult = await writeNotesAgent(prompt, researchResult);

    console.log(`Writer completed.`);
    console.log(`Word Count: ${writeresult.wordcount}`);
    console.log(`Sections Count: ${writeresult.sectionscount}`);
    
    await logAgentAction({
      agent: 'writer',
      input: researchResult.rawOutput.substring(0, 500),
      output: JSON.stringify(writeresult),
      run_id: runId,
      status: 'success',
      metadata: {
        wordCount: writeresult.wordcount,
        sectionsCount: writeresult.sectionscount,
      }
    })
    console.log("Writer logs are saved.")

    const mockContent = `Reading your docs \n\n Looking for resources based on your PRD \n\n ${prompt.substring(
      0,
      200
    )}...`;

    await updatePost(runId, {
      final_content: writeresult.draft,
      status: "completed",
      scores: {
        research_quality: researchResult.topics.length >= 3 ? 'good' : 'needs_improvement',
        word_count: writeresult.wordcount,
        sections_count: writeresult.sectionscount
      }
    });

    return NextResponse.json({
      success: true,
      runId,
      finalContent: writeresult.draft,
      pipelines: {research: {
          topics: researchResult.topics,
          findingsCount: researchResult.findings.length,
          sourcesCount: researchResult.sources.length
        },
        writer: {
          wordCount: writeresult.wordcount,
          sectionsCount: writeresult.sectionscount
        }},
      metrics: {
        agentsRun: 2,
        totalWordCount: writeresult.wordcount,
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
