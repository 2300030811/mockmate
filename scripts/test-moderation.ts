import { validateNickname } from "../utils/moderation";

const testCases = [
  { name: "Legit Player", expected: true },
  { name: "f@ck", expected: false },
  { name: "sh1t", expected: false },
  { name: "fuuuck", expected: false },
  { name: "FUCK", expected: false },
  { name: "f u c k", expected: false },
  { name: "fаck", expected: false }, // Cyrillic 'а' - now blocked by character set
  { name: "f.u.c.k", expected: false }, // Blocked by character set
  { name: "asshole", expected: false },
  { name: "bitch", expected: false },
  { name: "p u s s y", expected: false },
  { name: "1", expected: false }, // Too short
  { name: "thisnicknameisabittoolongforthesystem", expected: false }, // Too long
];

console.log("🚀 Starting Nickname Moderation Tests...\n");

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = validateNickname(tc.name);
  if (result.success === tc.expected) {
    console.log(`✅ PASSED: "${tc.name}" -> ${result.success ? "Allowed" : "Blocked (" + result.error + ")"}`);
    passed++;
  } else {
    console.error(`❌ FAILED: "${tc.name}" -> expected ${tc.expected}, got ${result.success}`);
    failed++;
  }
}

console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
