// test-researcher.ts (in root directory)
import { runResearcher } from '@/app/agents/researcher'

async function test() {
  const samplePRD = `
Build a task management app for remote teams.

Key Features:
- Smart task prioritization using AI
- Automated daily standup summaries
- Integration with Slack and GitHub
- Real-time collaboration
- Mobile app for iOS and Android

Target Audience: 
- Tech startups and software teams
- 5-20 employees
- Remote-first companies

Goals:
- Reduce meeting time by 50%
- Improve task completion rates by 30%
- Seamless developer workflow integration
  `.trim()

  console.log('🧪 Testing Researcher Agent\n')
  console.log('='.repeat(60))
  console.log('PRD Preview:', samplePRD.substring(0, 100) + '...')
  console.log('='.repeat(60))
  console.log('\n🚀 Running researcher...\n')

  try {
    const startTime = Date.now()
    const result = await runResearcher(samplePRD)
    const duration = Date.now() - startTime
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ TEST PASSED')
    console.log('='.repeat(60))
    console.log(`\n⏱️  Duration: ${duration}ms\n`)
    
    console.log('📋 Topics Found:')
    result.topics.forEach((topic, i) => {
      console.log(`   ${i + 1}. ${topic}`)
    })
    
    console.log('\n🔍 Findings:')
    result.findings.forEach((finding, i) => {
      const preview = finding.length > 100 
        ? finding.substring(0, 100) + '...' 
        : finding
      console.log(`   ${i + 1}. ${preview}`)
    })
    
    if (result.sources.length > 0) {
      console.log('\n🔗 Sources:')
      result.sources.forEach((source, i) => {
        console.log(`   ${i + 1}. ${source}`)
      })
    }
    
    console.log('\n📊 Summary:')
    console.log(`   - Topics: ${result.topics.length}`)
    console.log(`   - Findings: ${result.findings.length}`)
    console.log(`   - Sources: ${result.sources.length}`)
    console.log(`   - Raw output length: ${result.rawOutput.length} characters`)
    
  } catch (error) {
    console.log('\n' + '='.repeat(60))
    console.log('❌ TEST FAILED')
    console.log('='.repeat(60))
    console.error('\n💥 Error Details:')
    console.error(error)
    
    if (error instanceof Error) {
      console.error('\nMessage:', error.message)
      console.error('\nStack:', error.stack)
    }
  }
}

test()