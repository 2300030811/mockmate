
const fs = require('fs');

async function scanExplanations() {
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
        let count = 0;

        console.log("--- Suspicious Explanations ---");
        data.forEach(batch => {
            if (batch.questions) {
                batch.questions.forEach(q => {
                    let expl = q.explanation || "";
                    // Remove citations
                    expl = expl.replace(/\[cite: \d+\]/g, '').trim();

                    const suspicious = 
                        expl.includes("Wait,") || 
                        expl.includes("I will") || 
                        expl.includes("PDF says") ||
                        expl.includes("PDF source") ||
                        expl.includes("**Correction**") ||
                        expl.toLowerCase().includes("freaking out") ||
                        expl.length > 500; 

                    if (suspicious) {
                        count++;
                        console.log(`\n### ID: ${batch.batchId}-${q.id}`);
                        console.log(`Question: ${q.question.replace(/\n/g, ' ')}`);
                        console.log(`Snippet: ${q.code ? q.code.replace(/\n/g, '\\n') : 'N/A'}`);
                        console.log(`Current Explanation: ${expl}`);
                    }
                });
            }
        });

        console.log(`\nTotal suspicious found: ${count}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

scanExplanations();
