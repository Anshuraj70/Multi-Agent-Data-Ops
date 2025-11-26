import { runResearcher } from '@/app/agents/researcher'
import { writeNotesAgent } from '@/app/agents/writer'

async function test() {
  const samplePRD = `
Build a task management app for remote teams called "TaskFlow"

Key Features:
- AI-powered task prioritization
- Real-time collaboration
- Integration with Slack and GitHub
- Automated standup reports
- Mobile apps for iOS and Android

Target Audience: Tech startups with 5-20 employees

Goals:
- Reduce meeting time by 50%
- Improve task completion rates by 30%
- Seamless developer workflow
  `.trim()

  console.log(' Testing Writer Agent\n')
  console.log('='.repeat(60))
  console.log('STEP 1: Running Researcher...\n')

  try {
    // First get research
    const research = await runResearcher(samplePRD)
    console.log(' Research complete\n')
    console.log('Topics:', research.topics)
    console.log('\n' + '='.repeat(60))
    console.log('STEP 2: Running Writer...\n')

    // Then write the blog
    const writer = await writeNotesAgent(samplePRD, research)
    
    console.log('\n' + '='.repeat(60))
    console.log(' TEST PASSED')
    console.log('='.repeat(60))
    console.log(`\n Stats:`)
    console.log(`   - Word Count: ${writer.wordcount}`)
    console.log(`   - Sections: ${writer.sectionscount}`)
    console.log('\n Draft Preview (first 500 chars):')
    console.log('-'.repeat(60))
    console.log(writer.draft.substring(0, 500) + '...')
    console.log('-'.repeat(60))

  } catch (error) {
    console.log('\n' + '='.repeat(60))
    console.log(' TEST FAILED')
    console.log('='.repeat(60))
    console.error(error)
  }
}

test()
