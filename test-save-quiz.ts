import { saveQuizResult } from "./app/actions/results";

async function run() {
    const sessionId = "test-session-123";
    const category = "aws";
    const userAnswers = { "1": "A", "2": "B" };
    const totalQuestions = 2;

    console.log("Simulating first save (no nickname)...");
    const res1 = await saveQuizResult({
        sessionId,
        category,
        userAnswers,
        totalQuestions
    });
    console.log("First save result:", res1);

    console.log("Simulating second save (with nickname)...");
    const res2 = await saveQuizResult({
        sessionId,
        category,
        userAnswers,
        totalQuestions,
        nickname: "ProTester"
    });
    console.log("Second save result:", res2);
}

run();
