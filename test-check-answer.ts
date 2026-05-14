import { getCorrectAnswers, checkAnswer } from "./utils/quiz-helpers";
import { getRawQuestions } from "./app/actions/results"; // Wait, getRawQuestions is not exported from results.ts. It's in quiz.ts probably.

async function test() {
    const q = {
        id: 1,
        type: 'mcq',
        question: "A company is deploying...",
        options: [
            "On-Demand Instances",
            "Spot Instances",
            "Reserved Instances",
            "Dedicated Instances"
        ],
        answer: "Spot Instances"
    };

    console.log("getCorrectAnswers:", getCorrectAnswers(q as any));
    console.log("checkAnswer with ['B']:", checkAnswer(q as any, ["B"]));
}

test();
