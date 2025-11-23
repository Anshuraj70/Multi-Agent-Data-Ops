// Agent result types
export interface ResearchResult {
  topics: string[]
  findings: string[]
  sources: string[]
  rawOutput: string
}

export interface WriterResult {
  draft: string
  wordCount: number
  rawOutput: string
}

export interface FactCheckResult {
  passed: boolean
  issues: string[]
  feedback?: string
  rawOutput: string
}

export interface PolishedResult {
  content: string
  improvements: string[]
  rawOutput: string
}

// Database types (already have these)
export interface AgentLog {
  agent: string
  input: string
  output: string
  run_id: string
  metadata?: any
  status?: string
}

export interface Post {
  prd_text: string
  run_id: string
  final_content?: string
  scores?: any
  status?: string
}