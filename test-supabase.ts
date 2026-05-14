import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fioyiicfahgwxzlhfjie.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3lpaWNmYWhnd3h6bGhmamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mjc1MjgsImV4cCI6MjA4NjUwMzUyOH0.DZ5XNC17MEBe6iZ_fDHNWG-SdAkhPi4oxiFmX30HXk0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching leaderboard...");
    let query = supabase
            .from('quiz_results')
            .select('id, nickname, score, total_questions, completed_at')
            .eq('category', 'aws')
            .not('nickname', 'is', null)
            .neq('nickname', '')
            .gt('score', 0);

    const { data, error } = await query.limit(10);
    if (error) {
        console.error("Supabase error:", error);
    } else {
        console.log("Success:", data);
    }
}
run();
