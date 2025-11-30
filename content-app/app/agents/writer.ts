import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { ResearchResult } from "./researcher";
import { Console } from "console";
import { WriterResult } from "@/app/types";



export async function correctIssuesInDraft(oldDraft: string, issues: string[]){

  try{
    console.log("Correcting issues in draft ...");
    const issuesList = issues.map((issue, index) => `${index + 1}. ${issue}`).join("\n");
    const result = await generateText({
      model: xai("grok-beta"),
      system: `You are an expert blog writer for a technical content team.`,
      prompt: `You are given a blog draft that has some factual issues. 
      Blog: ${oldDraft}
      Issues found:
      ${issuesList}
      Your task is to correct those issues in the draft without changing the overall tone and style of the writing.`
    });
    const correctedDraft =  result.text;
    const wordcount = correctedDraft.trim().split(/\s+/).length;
    const sectionscount = (correctedDraft.match(/^#{1,3}\s+/gm) || []).length;
    console.log("Draft correction completed.");


    return {correctedDraft, wordcount, sectionscount, rawoutput: correctedDraft};
  }catch(err){
    console.error(`Error found in correctIssuesInDraft: ${err}`);
    throw err;}
}


export async function writeNotesAgent(
  prompt: String,
  keywords: ResearchResult
) {
  try {
    console.log(`Writer agent starting .....`);
    console.log(`topics to cover: ${keywords.topics.join(",")}`);
    console.log(`Findings to incorporate: ${keywords.findings.join(",")}`);

    const researchSummary = `
**Key Topics:**
${keywords.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

**Research Findings:**
${keywords.findings.map((f, i) => `${i + 1}. ${f}`).join("\n\n")}

${
  keywords.sources.length > 0
    ? `**Sources:**\n${keywords.sources
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n")}`
    : ""
}
    `.trim();

    const result = await generateText({
      model: xai("grok-beta"),
      system: `You are an expert blog writer for a technical content team. 

Your task:
1. Write a comprehensive, engaging blog post based on the PRD and research
2. Structure: Title → Introduction → Main Content (multiple sections) → Conclusion
3. Incorporate ALL research findings naturally into the content
4. Use markdown formatting (headers, lists, bold, etc.)
5. Write in a professional yet accessible tone
6. Aim for 800-1200 words

The blog should educate readers about the product while being engaging and well-researched.`,

      prompt: `Write a detailed blog post for this product:

# Product Requirements Document (PRD)
${prompt}

---

# Research Materials
${researchSummary}

---

Write a complete blog post that:
- Starts with an engaging title and introduction
- Covers all key topics from the research
- Incorporates the findings naturally
- Ends with a compelling conclusion
- Uses proper markdown formatting

Begin writing now:`,
    });
    if (!result.text || result.text.trim().length === 0) {
      throw new Error("Writer Agent returned no final output");
    }
    const draft = result.text;
    const wordcount = draft.trim().split(/\s+/).length;
    const sectionscount = (draft.match(/^#{1,3}\s+/gm) || []).length;

    let parsed : WriterResult;
    parsed = {
      draft: draft,
      wordCount: wordcount,
      sectionsCount: sectionscount,
      rawOutput: draft
    };
    return parsed;
    
  } catch (error) {
    console.error("Error in Writer agent:", error);
    throw error;
  }
}
