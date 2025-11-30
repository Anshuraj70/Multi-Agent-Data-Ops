import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { FactCheckResult } from "../types";

// export interface FactCheckResult {
//   passed: boolean;
//   issues: string[];
//   feedback?: string;
//   rawOutput: string;
// }

export async function factCheckerAgent(
  prompt: string,
  draftContent: string,
  researchFindings: string[]
) {
  try {
    console.log("Fact checker processing ...");

    const unprocessesdResult = `Go through this blog draft throughly. ${draftContent} 
        These are list of sources used to write this blog. ${researchFindings.join(
          ", "
        )}`;

    const result = await generateText({
      model: xai("grok-beta"),
      system: `You are an expert peer reviewer for a technical content team.
            Your tasks: 
            1. Reveiw the blog draft for factual accuracy against the research findings provided.
            2. Identify any factual inaccuracies, inconsistencies, or unsupported claims.
            3. Provide constructive feedback on how to improve the factual accuracy of the content.
            4. Summarize your findings in a clear and concise manner.`,
      prompt: `Review the blog draft and check the correctness of the content altogether.
            # Here is the blog draft: 
            ${unprocessesdResult}
            # The actual task: 
            ${prompt}
            --------------
            The output should be in the following Json format: 
            1. passed: boolean - true if the draft passes fact-check, false otherwise
            2. issues: string[] - list of identified factual issues or else empty array
            3. feedback: string - constructive feedback to improve factual accuracy
            4. rawOutput: string - the complete raw output from the agent`,
    });

    if (!result.text || result.text.trim().length === 0) {
      throw new Error("Fact Checker Agent returned no final output");
    }

    const review = result.text;

    let parsed: FactCheckResult;

    try {
      const jsonMatch = review.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        console.log("Fact checker completed.");
        parsed = {
          passed: jsonData.passed || false,
          issues: jsonData.issues || [],
          feedback: jsonData.feedback || "",
          rawOutput: review,
        };

        return parsed;
      } else {
        parsed = {
          passed: false,
          issues: [],
          feedback: "Failed to parse fact-checker output",
          rawOutput: review,
        };
        return parsed;
      }
    } catch (err) {
      console.error(`Error found in factCheckerAgent parsing: ${err}`);
      throw err;
    }
  } catch (err) {
    console.error(`Error found in factCheckerAgent: ${err}`);
    throw err;
  }
}
