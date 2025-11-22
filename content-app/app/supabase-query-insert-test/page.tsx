import { logAgentAction } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default function TestInsertPage() {
  async function testInsert() {
    "use server";

    const testData = {
      agent: "test-agent",
      input: "Test input",
      output: "Test output",
      run_id: "test-run-" + Date.now(),
      metadata: { test: true },
      status: "success",
    };

    // try {
      await logAgentAction(testData);
      redirect("/test");
    // } catch (error) {
    //   console.error("Insert failed:", error);
    // }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Database Insert</h1>
      <form action={testInsert}>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Insert Test Data
        </button>
      </form>
    </div>
  );
}
