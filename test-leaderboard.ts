import { getLeaderboard } from "./app/actions/results";

async function test() {
    console.log("Testing leaderboard fetch...");
    const res = await getLeaderboard("aws", "weekly");
    console.log("Result:", res);
}
test();
