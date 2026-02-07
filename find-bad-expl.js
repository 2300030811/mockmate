
const fs = require('fs');

async function findBadExplanation() {
    const url = "https://mockmatequiz.blob.core.windows.net/quizzes/pcap1.json";
    try {
        const response = await fetch(url);
        const text = await response.text();
        let jsonString = text.replace(/\[cite_start\]/g, '').trim();
        
         if (jsonString.startsWith('{')) {
             jsonString = '[' + jsonString.replace(/}\s*\{/g, '},{') + ']';
        } else if (!jsonString.startsWith('[')) {
             jsonString = '[' + jsonString + ']';
        }

        const data = JSON.parse(jsonString);
        let found = false;

        data.forEach(batch => {
            if (batch.questions) {
                batch.questions.forEach(q => {
                    if (q.explanation && q.explanation.includes("Wait, the explanation in PDF indicates")) {
                        console.log("Found Question ID:", q.id);
                        console.log("Batch ID:", batch.batchId);
                        console.log("Question:", q.question);
                        console.log("Explanation:", q.explanation);
                        found = true;
                    }
                });
            }
        });

        if (!found) console.log("Not found.");

    } catch (e) {
        console.error("Error:", e);
    }
}

findBadExplanation();
