import { NextRequest, NextResponse } from "next/server";
import { createPost, updatePost, logAgentAction } from "@/lib/supabase/queries";

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

    const mockContent = `Reading your docs \n\n Looking for resources based on your PRD \n\n ${prompt.substring(
      0,
      200
    )}...`;

    await updatePost(runId, {
      final_content: mockContent,
      status: "completed",
    });

    return NextResponse.json({
      success: true,
      runId,
      finalContent: mockContent,
      metrics: {
        agentsRun: 1,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
