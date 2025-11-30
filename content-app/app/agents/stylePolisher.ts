import { PolishedResult } from "../types";
import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";


export async function stylePolisherAgent(
  draftContent: string,
  prompt: string
) {
  try {
    console.log("Style Polisher processing ...");

    const result = await generateText({
        model: xai("grok-beta"),
        system: `You are an expert author in technical writing of a product.
        Your task: 
        1. Review the blog draft for style, tone, and clarity.
        2. Make improvements to enhance readability and engagement.
        3. Ensure you don't leave behind he technical terminologies used in the draft. Before speaking about it 
        give a clear explanation of the term in simple words. Explain its need and role. 
        4. End with an example for every technical and important term used in the blog.
        5. Whole product should always be divided into multiple sections with proper headings.
        6. Summarize the content at the end of the blog.
        The blog should be insightful and clear about is needs.`,
        prompt: `Here is the blog draft:
        ${draftContent}
        Review the draft and polish the style, tone, and clarity. Make improvements as needed.
        # The actual task:
        ${prompt}
        Return JSON with 'content' (polished text) and 'improvements' (list of changes made).
        --------------`,
    });
    if (!result.text || result.text.trim().length === 0) {
      throw new Error("Style Polisher Agent returned no final output");
    }
    const polishedDraft = result.text;

    console.log("Style Polisher completed.");

    let parsed: PolishedResult;

    try {
      // Try to parse JSON response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        parsed = {
          content: jsonData.content || result.text,
          improvements: jsonData.improvements || ["General style improvements"],
          rawOutput: result.text,
        };
      } else {
        // Fallback: treat entire response as polished content
        parsed = {
          content: result.text,
          improvements: ["Content polished (no specific improvements tracked)"],
          rawOutput: result.text,
        };
      }
    }catch (err) {
      console.error(`Error parsing in style polisher agent: ${err}`);
      parsed = {
        content: result.text,
        improvements: ["Content polished (parsing failed)"],
        rawOutput: result.text, 
      };
    }
    return parsed;

}catch (err) {
    console.error(`Error found in Style Polisher: ${err}`);
    throw err;
  }
}