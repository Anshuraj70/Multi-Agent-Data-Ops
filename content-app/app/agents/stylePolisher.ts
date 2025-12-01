import { PolishedResult } from "../types";
import { grok_model } from "@/lib/langchain";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";


const stylePolisherPrompt = PromptTemplate.fromTemplate(`
You are an expert technical content editor and writing coach.

# Your Tasks:
1. Review the blog draft for style, tone, and clarity
2. Make improvements to enhance readability and engagement
3. Explain technical terms clearly before using them
4. Add examples for important technical concepts
5. Ensure proper section structure with clear headings
6. Add a comprehensive summary at the end

# Blog Draft to Polish:
{draftContent}

# Original Requirements (Context):
{prd}

# Your Goal:
Transform this draft into a polished, professional blog post that:
- Maintains technical accuracy
- Is accessible to the target audience
- Has clear structure and flow
- Includes helpful examples
- Ends with a strong summary

Return ONLY the polished blog text in markdown format. Do not include JSON or metadata.
`)

const outputParser = new StringOutputParser()

const stylePolisherChain = RunnableSequence.from([
  stylePolisherPrompt,
  grok_model,
  outputParser,
])

export async function stylePolisherAgent(
  draftContent: string,
  prd: string
): Promise<PolishedResult> {
  try {
    console.log("Style Polisher processing...");
    console.log(`Draft length: ${draftContent.length} chars`);

    const polishedContent = await stylePolisherChain.invoke({
      draftContent: draftContent,
      prd: prd,
    });
    
    if (!polishedContent || polishedContent.trim().length === 0) {
      throw new Error("Style Polisher returned no output");
    }

    const wordCount = polishedContent.trim().split(/\s+/).length;
    const sectionsCount = (polishedContent.match(/^#{1,3}\s+/gm) || []).length;

    console.log("Style Polisher completed");
    console.log(`Final word count: ${wordCount}`);
    console.log(`Sections: ${sectionsCount}`);

    return {
      content: polishedContent,
      improvements: ["Style polished and enhanced for readability"],
      rawOutput: polishedContent,
    };

  } catch (error) {
    console.error(" Style Polisher error:", error);
    throw error;
  }
}