"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { seedDatabase } from "@/app/actions/migrate";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleMigrate = async () => {
    setLoading(true);
    try {
      const res = await seedDatabase();
      setResults(res);
    } catch (error) {
      console.error(error);
      alert("Migration failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 py-20">
      <h1 className="text-3xl font-bold mb-4">Database Migration</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This will fetch all existing quiz data from the external JSON URLs and store them in your Supabase database.
      </p>

      {!results ? (
        <Button 
          onClick={handleMigrate} 
          disabled={loading}
          size="lg"
          className="gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading ? "Migrating Data..." : "Start Migration"}
        </Button>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Migration Results:</h2>
          <div className="grid gap-3">
            {results.map((res) => (
              <div 
                key={res.category} 
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  res.status === 'success' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {res.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium uppercase">{res.category}</span>
                </div>
                <div className="text-sm">
                  {res.status === 'success' ? (
                    <span className="text-green-700 dark:text-green-400">{res.count} questions saved</span>
                  ) : (
                    <span className="text-red-700 dark:text-red-400">Error: {res.error || res.reason}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4" onClick={() => setResults(null)}>
            Reset & Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
