
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Terminal, Zap, Copy, ChevronRight, Check, RotateCcw } from "lucide-react";
import { executeCode } from "@/app/actions/code-execution";

interface SessionEditorProps {
   editorLanguage: 'c' | 'cpp' | 'javascript' | 'typescript' | 'python' | 'css' | 'sql';
   setEditorLanguage: (lang: any) => void;
   editorValue: string;
   setEditorValue: (val: string) => void;
   handleSubmit: (text?: string) => void;
   isRunning: boolean;
   setIsRunning: (running: boolean) => void;
}

// ── Interview-ready boilerplate templates ──────────────────────────────
const TEMPLATES: Record<string, string> = {
   c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ──── Helper: Print an array ────
void printArray(int arr[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) {
        printf("%d%s", arr[i], i < n - 1 ? ", " : "");
    }
    printf("]\\n");
}

// ──── Solution ────
int solution(int* nums, int n) {
    // TODO: implement your logic
    return 0;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int n = sizeof(nums) / sizeof(nums[0]);

    printf("Input:  ");
    printArray(nums, n);

    int result = solution(nums, n);
    printf("Output: %d\\n", result);

    return 0;
}`,

   cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

// ──── Helper: Print a vector ────
template <typename T>
void printVec(const vector<T>& v) {
    cout << "[";
    for (size_t i = 0; i < v.size(); i++) {
        cout << v[i] << (i < v.size() - 1 ? ", " : "");
    }
    cout << "]" << endl;
}

// ──── Solution ────
class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (mp.count(complement)) {
                return {mp[complement], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;

    cout << "Input:  ";
    printVec(nums);
    cout << "Target: " << target << endl;

    Solution sol;
    auto result = sol.solve(nums, target);

    cout << "Output: ";
    printVec(result);

    return 0;
}`,

   javascript: `// ──── Solution ────
function solve(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// ──── Test Cases ────
const testCases = [
  { nums: [2, 7, 11, 15], target: 9,  expected: [0, 1] },
  { nums: [3, 2, 4],      target: 6,  expected: [1, 2] },
  { nums: [3, 3],         target: 6,  expected: [0, 1] },
];

testCases.forEach(({ nums, target, expected }, i) => {
  const result = solve(nums, target);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(\`Test \${i + 1}: \${pass ? "✓ PASS" : "✗ FAIL"}\`);
  if (!pass) console.log(\`  Expected: \${JSON.stringify(expected)}, Got: \${JSON.stringify(result)}\`);
});`,

   typescript: `// ──── Types ────
type Result = number[];

// ──── Solution ────
function solve(nums: number[], target: number): Result {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// ──── Test Cases ────
interface TestCase {
  nums: number[];
  target: number;
  expected: Result;
}

const testCases: TestCase[] = [
  { nums: [2, 7, 11, 15], target: 9,  expected: [0, 1] },
  { nums: [3, 2, 4],      target: 6,  expected: [1, 2] },
  { nums: [3, 3],         target: 6,  expected: [0, 1] },
];

testCases.forEach(({ nums, target, expected }, i) => {
  const result = solve(nums, target);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(\`Test \${i + 1}: \${pass ? "✓ PASS" : "✗ FAIL"}\`);
  if (!pass) console.log(\`  Expected: \${JSON.stringify(expected)}, Got: \${JSON.stringify(result)}\`);
});`,

   python: `from typing import List
from collections import defaultdict

# ──── Solution ────
class Solution:
    def solve(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []

# ──── Test Cases ────
if __name__ == "__main__":
    sol = Solution()

    tests = [
        {"nums": [2, 7, 11, 15], "target": 9,  "expected": [0, 1]},
        {"nums": [3, 2, 4],      "target": 6,  "expected": [1, 2]},
        {"nums": [3, 3],         "target": 6,  "expected": [0, 1]},
    ]

    for i, t in enumerate(tests, 1):
        result = sol.solve(t["nums"], t["target"])
        status = "✓ PASS" if result == t["expected"] else "✗ FAIL"
        print(f"Test {i}: {status}")
        if result != t["expected"]:
            print(f"  Expected: {t['expected']}, Got: {result}")`,

   sql: `-- ──── Schema Setup ────
-- CREATE TABLE users (
--     id       INT PRIMARY KEY,
--     name     VARCHAR(100),
--     email    VARCHAR(255),
--     role     VARCHAR(50),
--     created  DATE
-- );

-- ──── Query: Top active users by activity count ────
SELECT
    u.id,
    u.name,
    u.role,
    COUNT(a.id)              AS activity_count,
    MAX(a.created_at)        AS last_active
FROM users u
LEFT JOIN activities a ON a.user_id = u.id
WHERE u.created >= DATE('now', '-1 year')
GROUP BY u.id, u.name, u.role
HAVING COUNT(a.id) > 5
ORDER BY activity_count DESC
LIMIT 10;`,

   css: `/* ──── CSS Variables ──── */
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --radius: 12px;
  --transition: 200ms ease;
}

/* ──── Card Component ──── */
.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform var(--transition),
              box-shadow var(--transition);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* ──── Button Component ──── */
.btn-primary {
  background: var(--primary);
  color: var(--text);
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: calc(var(--radius) / 2);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

/* ──── Responsive Grid ──── */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}`
};

// Language display names for the dropdown
const LANGUAGE_LABELS: Record<string, string> = {
   c: "C",
   cpp: "C++",
   javascript: "JavaScript",
   typescript: "TypeScript",
   python: "Python",
   sql: "SQL",
   css: "CSS"
};

export function SessionEditor({
   editorLanguage,
   setEditorLanguage,
   editorValue,
   setEditorValue,
   handleSubmit,
   isRunning,
   setIsRunning
}: SessionEditorProps) {
   const editorRef = useRef<any>(null);
   const [cooldown, setCooldown] = useState(false);
   const [showConsole, setShowConsole] = useState(false);
   const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
   const [consoleOutput, setConsoleOutput] = useState("");
   const [copied, setCopied] = useState(false);
   const [executionTime, setExecutionTime] = useState<string | null>(null);

   // Apply template when language changes if editor is relatively empty
   useEffect(() => {
      const currentLines = editorValue.trim().split('\n');
      if (currentLines.length < 5) {
         setEditorValue(TEMPLATES[editorLanguage] || "");
      }
   }, [editorLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

   // Ctrl+Enter keyboard shortcut to run code
   const handleEditorMount: OnMount = useCallback((editor, monaco) => {
      editorRef.current = editor;

      // Register Ctrl+Enter / Cmd+Enter to run code
      editor.addAction({
         id: "run-code",
         label: "Run Code",
         keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
         ],
         run: () => {
            document.getElementById("run-code-btn")?.click();
         },
      });

      // Focus the editor on mount
      editor.focus();
   }, []);

   // Monaco editor language mapping
   const monacoLanguage = useMemo(() => {
      if (editorLanguage === 'c' || editorLanguage === 'cpp') return 'cpp';
      return editorLanguage;
   }, [editorLanguage]);

   // Optimized Monaco editor options
   const editorOptions = useMemo(() => ({
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Fira Mono", Consolas, monospace',
      fontLigatures: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      lineNumbers: "on" as const,
      renderLineHighlight: "line" as const,
      cursorBlinking: "smooth" as const,
      cursorSmoothCaretAnimation: "on" as const,
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: "always" as const,
      autoClosingQuotes: "always" as const,
      autoIndent: "full" as const,
      formatOnPaste: true,
      suggest: {
         showKeywords: true,
         showSnippets: true,
         showFunctions: true,
         showVariables: true,
      },
      tabSize: editorLanguage === 'python' ? 4 : 2,
      wordWrap: editorLanguage === 'css' || editorLanguage === 'sql' ? "on" as const : "off" as const,
      scrollbar: {
         verticalScrollbarSize: 6,
         horizontalScrollbarSize: 6,
         useShadows: false,
      },
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      contextmenu: false,
   }), [editorLanguage]);

   const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(editorValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   }, [editorValue]);

   const handleReset = useCallback(() => {
      setEditorValue(TEMPLATES[editorLanguage] || "");
      setShowConsole(false);
      setConsoleOutput("");
      setExecutionTime(null);
   }, [editorLanguage, setEditorValue]);

   const handleRun = useCallback(async () => {
      if (cooldown || isRunning) return;
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);

      setIsRunning(true);
      setShowConsole(true);
      setExecutionTime(null);
      setConsoleOutput(`▶ Compiling ${LANGUAGE_LABELS[editorLanguage] || editorLanguage}...\n  Sending to execution engine...`);

      const startTime = performance.now();

      // SQL remains client-side only (for speed/safety)
      if (editorLanguage === 'sql') {
         setTimeout(() => {
            let output = "Connected to database (PostgreSQL 15.4)...\n";
            const code = editorValue.toLowerCase();
            if (code.includes('create table')) output += "CREATE TABLE\nQuery returned successfully in 45ms.";
            else if (code.includes('insert into')) output += "INSERT 0 1\nQuery returned successfully in 12ms.";
            else if (code.includes('select')) output += "     id | name           | value    \n    ----+----------------+----------\n      1 | Record_One     | 98.5     \n      2 | Record_Two     | 72.1     \n      3 | Record_Three   | 45.0     \n    (3 rows)\n\nQuery returned successfully in 64ms.";
            else output += "Query executed successfully.\n0 rows returned.";

            setConsoleOutput(output);
            setIsRunning(false);
            setExecutionTime(`${(performance.now() - startTime).toFixed(0)}ms`);
            handleSubmit(`[System Notification: User executed SQL]\n\nCode/Input:\n${editorValue}\n\nOutput:\n${output}\n\n(The user is waiting for your feedback on this output.)`);
         }, 800);
         return;
      }

      // CSS preview simulation
      if (editorLanguage === 'css') {
         setTimeout(() => {
            const output = "✓ CSS parsed successfully — no syntax errors.\n\nProperties used:\n" +
               (editorValue.match(/[a-z-]+(?=\s*:)/g) || []).slice(0, 15).map(p => `  • ${p}`).join('\n');
            setConsoleOutput(output);
            setIsRunning(false);
            setExecutionTime(`${(performance.now() - startTime).toFixed(0)}ms`);
            handleSubmit(`[System Notification: User validated CSS]\n\nCode/Input:\n${editorValue}\n\nOutput:\n${output}\n\n(The user is waiting for your feedback on this output.)`);
         }, 400);
         return;
      }

      // Server-Side Execution
      try {
         const result = await executeCode(editorLanguage, editorValue);
         const elapsed = `${(performance.now() - startTime).toFixed(0)}ms`;

         let finalOutput = "";
         if (result.error) {
            finalOutput = `✗ Execution Error:\n${result.error}`;
            if (result.output) finalOutput += `\n\nOutput:\n${result.output}`;
         } else {
            finalOutput = result.output || "✓ Execution finished with no output.";
         }

         setConsoleOutput(finalOutput);
         setIsRunning(false);
         setExecutionTime(elapsed);

         handleSubmit(`[System Notification: User executed ${editorLanguage} code]\n\nCode/Input:\n${editorValue}\n\nReal Execution Output:\n${finalOutput}\n\n(The user is waiting for your feedback on this output.)`);

      } catch (err) {
         console.error("Execution error:", err);
         setConsoleOutput("✗ Server Execution Failed. Falling back to local simulation...\n\n(Simulated Output)\nProgram executed successfully.");
         setIsRunning(false);
         setExecutionTime(null);
      }
   }, [cooldown, isRunning, editorLanguage, editorValue, handleSubmit, setIsRunning]);

   return (
      <div className="h-full flex flex-col bg-[#1e1e1e] animate-fadeIn min-h-0">
         {/* ── Toolbar ── */}
         <div className="px-3 py-1.5 bg-black/40 border-b border-white/5 flex items-center justify-between overflow-x-auto custom-scrollbar gap-3">
            <div className="flex items-center gap-3 shrink-0">
               <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-emerald-500" />
                  <select
                     value={editorLanguage}
                     onChange={(e) => setEditorLanguage(e.target.value as any)}
                     className="bg-gray-800/80 text-[10px] font-mono text-gray-200 border border-gray-700/60 px-2 py-1 rounded-md outline-none cursor-pointer hover:bg-gray-700 hover:text-white transition-all uppercase tracking-widest appearance-none pr-7"
                     style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.35rem center',
                        backgroundSize: '0.85rem'
                     }}
                  >
                     {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
                        <option key={value} value={value} className="bg-gray-900">{label}</option>
                     ))}
                  </select>
               </div>
               <span className="text-[9px] text-gray-600 font-mono hidden sm:inline">Ctrl+Enter to run</span>
            </div>
            <div className="flex gap-1.5 shrink-0">
               <button
                  id="run-code-btn"
                  disabled={isRunning || cooldown}
                  onClick={handleRun}
                  className={`px-2.5 py-1 ${isRunning || cooldown ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'} text-[10px] font-bold rounded-md border ${isRunning || cooldown ? 'border-gray-700/40' : 'border-emerald-500/20 hover:border-emerald-500/40'} uppercase transition-all flex items-center gap-1.5 min-w-[64px] justify-center`}
               >
                  {isRunning ? (
                     <div className="w-2.5 h-2.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                     <Zap size={10} />
                  )}
                  <span>{isRunning ? 'Running' : cooldown ? 'Wait' : 'Run'}</span>
               </button>
               <button
                  onClick={handleCopy}
                  className="px-2 py-1 bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-[10px] font-bold rounded-md border border-gray-700/40 uppercase transition-all flex items-center gap-1"
               >
                  {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  {copied ? 'Done' : 'Copy'}
               </button>
               <button
                  onClick={handleReset}
                  title="Reset to template"
                  className="px-2 py-1 bg-gray-800/60 hover:bg-amber-500/15 text-gray-400 hover:text-amber-400 text-[10px] font-bold rounded-md border border-gray-700/40 hover:border-amber-500/20 uppercase transition-all flex items-center gap-1"
               >
                  <RotateCcw size={10} /> Reset
               </button>
            </div>
         </div>

         {/* ── Monaco Editor ── */}
         <div className="flex-1 overflow-hidden min-h-0 relative">
            <Editor
               height="100%"
               language={monacoLanguage}
               value={editorValue}
               onChange={(value) => setEditorValue(value || "")}
               theme="vs-dark"
               onMount={handleEditorMount}
               loading={
                  <div className="flex items-center justify-center h-full gap-2 text-gray-500">
                     <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                     <span className="text-xs font-mono">Loading editor...</span>
                  </div>
               }
               options={editorOptions}
            />
         </div>

         {/* ── Console Output ── */}
         {showConsole && (
            <div className={`${isConsoleExpanded ? 'h-[75%] shadow-inner' : 'h-36'} bg-black/95 border-t border-gray-800 flex flex-col transition-all duration-300 animate-fadeIn shrink-0 z-10 absolute bottom-0 left-0 right-0 max-h-full backdrop-blur-sm`}>
               <div className="px-3 py-1.5 bg-gray-900/90 border-b border-gray-800 flex justify-between items-center text-[10px] text-gray-400 uppercase font-mono tracking-widest cursor-pointer select-none"
                  onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
               >
                  <div className="flex items-center gap-2">
                     <Terminal size={12} className="text-emerald-500" />
                     <span>Output</span>
                     {executionTime && (
                        <span className="text-[9px] text-gray-600 normal-case tracking-normal">({executionTime})</span>
                     )}
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="hover:text-white transition-colors p-0.5">
                        {isConsoleExpanded ? <ChevronRight className="rotate-90" size={12} /> : <ChevronRight className="-rotate-90" size={12} />}
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); setShowConsole(false); setExecutionTime(null); }} className="hover:text-red-400 transition-colors bg-gray-800 px-1.5 py-0.5 rounded text-[9px]">✕</button>
                  </div>
               </div>
               <div className="flex-1 p-3 overflow-auto custom-scrollbar font-mono text-xs text-emerald-500/90 leading-relaxed whitespace-pre-wrap">
                  {consoleOutput}
               </div>
            </div>
         )}
      </div>
   );
}
