import { createClient } from "@/lib/supabase/client"

export default async function TestPage() {
    const supabase = await createClient()


    const {data: logs, error} = await supabase
    .from('agent_logs')
    .select('*')
    .limit(5)

    return (
        <div className="p- 8">
            <h1 className="text-2xl font-bold mb-4"> Supabase Connection</h1>

            {error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error.message}
                </div>
            ) : (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <strong>Success!</strong> Connected to Supabase
                    <pre className="mt-4 bg-white p-4 rounded">
                        {JSON.stringify(logs, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}