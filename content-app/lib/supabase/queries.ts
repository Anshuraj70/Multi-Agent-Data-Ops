import { createClient } from './server'


export interface AgentLog{
    agent: string    
    input: string    
    output: string
    run_id: string
    metadata?: any
    status?: string 
}

export interface Post{
    prd_text: string
    run_id: string
    final_content?: string
    scores?: any
    status?: string
}

// Log an agent action

export async function logAgentAction(data: AgentLog){
    const supabase = await createClient()

    const { data: result, error} = await supabase
    .from('agent_logs')
    .insert(data)
    .select()
    .single()

    if(error) {
        console.error('Error logging agent action: ', error)
        throw error
    }

    return result
}

// Create a new post
export async function createPost(data: Post){
    const supabase = await createClient()

    const {data: result, error} = await supabase
    .from('posts')
    .insert(data)
    .select()
    .single()

    if(error) {
        console.error('Error creating post:', error)
        throw error
    }

    return result
}

//Update  a post
export async function updatePost(runId: string, updates: Partial<Post>){
    const supabase = await createClient()

    const {data: result, error} = await supabase
    .from('posts')
    .update(updates)
    .eq('run_id', runId)
    .select()
    .single()

    if(error){
        console.error('Error updating post:', error)
        throw error
    }

    return result
}

//GET post by run_id
export async function getPostByRunId(runId: string){
    const supabase = await createClient()

    const{data, error} = await supabase
    .from('posts')
    .select('*')
    .eq('run_id', runId)
    .single()

    if (error){
        console.error("Error fetching post:", error)
        throw error
    }

    return data
}

//GET all logs by using the runId
export async function getLogsByrunId(runId: string){
    const supabase = await createClient()

    const {data, error} = await supabase
    .from('agent_logs')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', {ascending: true})

    if(error){
        console.error('Error fetching logs:', error)
        throw error
    }

    return data
}

//Get all posts
export async function getAllPosts(){
    const supabase = await createClient()
    const {data, error} = await supabase
    .from('posts')
    .select("*")
    .order('created_at', {ascending: false})

    if(error){
        console.error('Error fetching posts:', error)
        throw error
    }

    return data
}



