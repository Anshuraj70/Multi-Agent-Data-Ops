"use client";
import SearchButton from "./UI/search-button";
import { FormEvent, useState } from "react";

export default function Home() {
  const [prompt, setprompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a valid prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    const newRunId = crypto.randomUUID();
    setRunId(newRunId);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, runId: newRunId }),
      });
      if (!resp.ok) {
        throw new Error(`API error: ${resp.statusText}`);
      }
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      console.error("Error fetching:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
          Multi-Agent Content Pipeline
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="prd"
              className="block text-sm font-medium mb-2 text-black dark:text-white"
            >
              Product Requirements Document (PRD)
            </label>
            <textarea
              id="prd"
              name="prd"
              placeholder="Enter your PRD here... Describe the product features, target audience, goals, etc."
              value={prompt}
              onChange={(e) => setprompt(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
              required
              disabled={isLoading}
            />
          </div>

          <SearchButton isLoading={isLoading} />
        </form>

        {/* Run ID Display */}
        {runId && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Run ID:</span> {runId}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Agents are working on your content...
              </p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && !isLoading && (
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Generated Blog Post
            </h2>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="prose dark:prose-invert max-w-none">
                {result.finalContent ? (
                  <div className="whitespace-pre-wrap">
                    {result.finalContent}
                  </div>
                ) : (
                  <p className="text-zinc-500">
                    Content generation in progress...
                  </p>
                )}
              </div>
            </div>

            {/* Metrics */}
            {result.metrics && (
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  Metrics
                </h3>
                <pre className="text-sm text-zinc-600 dark:text-zinc-400">
                  {JSON.stringify(result.metrics, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
