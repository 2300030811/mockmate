
const fs = require('fs');

async function testFetch() {
    const url = "https://mockmatequiz.blob.core.windows.net/quizzes/pcap1.json";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const text = await response.text();
        console.log("Total length:", text.length);
        console.log("First 100 chars:", text.substring(0, 100));
        console.log("Last 100 chars:", text.substring(text.length - 100));

        let jsonString = text.replace(/\[cite_start\]/g, '').trim();
        
        // Check for specific sequence between objects
        const regex = /}\s*\{/g;
        let match = regex.exec(jsonString);
        if (match) {
            console.log("Found match at index:", match.index);
            console.log("Match content:", JSON.stringify(match[0]));
        } else {
            console.log("No regex match found for /}\\s*\\{/g");
        }

        if (!jsonString.startsWith('[')) {
             jsonString = '[' + jsonString.replace(/}\s*\{/g, '},{') + ']';
        }

        try {
            JSON.parse(jsonString);
            console.log("Parse SUCCESS");
        } catch (e) {
            console.error("Parse FAILED:", e.message);
            // Find position of error
            const matchErr = e.message.match(/position (\d+)/);
            if (matchErr) {
                const pos = parseInt(matchErr[1]);
                console.log("Error context:", jsonString.substring(pos - 50, pos + 50));
            }
        }

    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testFetch();
