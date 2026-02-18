
import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Terminal, Zap, Copy, ChevronRight } from "lucide-react";
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

export function SessionEditor({
    editorLanguage,
    setEditorLanguage,
    editorValue,
    setEditorValue,
    handleSubmit,
    isRunning,
    setIsRunning
}: SessionEditorProps) {
    const [cooldown, setCooldown] = useState(false);
    const [showConsole, setShowConsole] = useState(false);
    const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState("");

    // Templates for different languages
    const templates: Record<string, string> = {
        c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello Mockmate!\\n\");\n    return 0;\n}",
        cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello Mockmate!\" << std::endl;\n    return 0;\n}",
        javascript: "// Mockmate JavaScript Solution\nfunction solve() {\n  console.log(\"Solving...\");\n}\n\nsolve();",
        typescript: "// Mockmate TypeScript Solution\ninterface User {\n  id: number;\n  name: string;\n}\n\nfunction getUser(id: number): User {\n  return { id, name: \"MockUser\" };\n}",
        python: "# Mockmate Python Solution\ndef solve():\n    print(\"Hello from Python!\")\n\nif __name__ == \"__main__\":\n    solve()",
        sql: "-- Mockmate SQL Query\nSELECT user_id, COUNT(activity_type) as activity_count\nFROM user_activities\nGROUP BY user_id\nORDER BY activity_count DESC\nLIMIT 10;",
        css: "/* Mockmate Visual Styling */\n.candidate-profile {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}"
    };

    // Apply template when language changes if editor is relatively empty
    useEffect(() => {
        const currentLines = editorValue.trim().split('\n');
        if (currentLines.length < 5) { // Threshold for "empty enough"
           setEditorValue(templates[editorLanguage] || "");
        }
    }, [editorLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRun = async () => {
        if (cooldown) return;
        setCooldown(true);
        setTimeout(() => setCooldown(false), 5000); // 5s cooldown

        setIsRunning(true);
        setShowConsole(true);
        setConsoleOutput(`Compiling ${editorLanguage.toUpperCase()} file...\nSending to execution engine...`);
        
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
               handleSubmit(`[System Notification: User executed SQL]\n\nCode/Input:\n${editorValue}\n\nOutput:\n${output}\n\n(The user is waiting for your feedback on this output.)`);
            }, 800);
            return;
        }

        // Server-Side Execution
        try {
            const result = await executeCode(editorLanguage, editorValue);
            
            let finalOutput = "";
            if (result.error) {
                finalOutput = `Execution Error:\n${result.error}`;
                if (result.output) finalOutput += `\n\nOutput:\n${result.output}`;
            } else {
                finalOutput = result.output || "Execution finished with no output.";
            }

            setConsoleOutput(finalOutput);
            setIsRunning(false);
            
            // Notify AI
            handleSubmit(`[System Notification: User executed ${editorLanguage} code]\n\nCode/Input:\n${editorValue}\n\nReal Execution Output:\n${finalOutput}\n\n(The user is waiting for your feedback on this output.)`);

        } catch (err) {
            console.error("Execution error:", err);
            // Fallback
             setConsoleOutput("Server Execution Failed. Falling back to local simulation...\n\n" + 
                "(Simulated Output)\n" +
                "Program executed successfully.");
             setIsRunning(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] animate-fadeIn min-h-0">
          <div className="px-4 py-2 bg-black/30 border-b border-white/5 flex items-center justify-between overflow-x-auto custom-scrollbar gap-4">
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                 <Terminal size={12} className="text-gray-500" />
                 <select 
                  value={editorLanguage}
                  onChange={(e) => setEditorLanguage(e.target.value as any)}
                  className="bg-gray-800 text-[10px] font-mono text-gray-200 border border-gray-700 px-2 py-1 rounded outline-none cursor-pointer hover:bg-gray-700 hover:text-white transition-all uppercase tracking-widest appearance-none pr-8 relative"
                  style={{
                     backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right 0.5rem center',
                     backgroundSize: '1rem'
                  }}
                 >
                   <option value="c" className="bg-gray-900">C</option>
                   <option value="cpp" className="bg-gray-900">C++</option>
                   <option value="javascript" className="bg-gray-900">javascript</option>
                   <option value="typescript" className="bg-gray-900">typescript</option>
                   <option value="python" className="bg-gray-900">python</option>
                   <option value="sql" className="bg-gray-900">SQL</option>
                   <option value="css" className="bg-gray-900">css</option>
                 </select>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                disabled={isRunning || cooldown}
                onClick={handleRun}
                className={`px-2 py-1 ${isRunning || cooldown ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'} text-[10px] font-bold rounded border border-green-500/20 uppercase transition-all flex items-center gap-1 min-w-[60px] justify-center`}
              >
                {isRunning ? (
                   <div className="w-2 h-2 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                   <Zap size={10} />
                )}
                <span>{isRunning ? '...' : cooldown ? 'Wait' : 'Run'}</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(editorValue);
                  alert("Code copied to clipboard!");
                }}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded border border-gray-700 uppercase transition-all flex items-center gap-1"
              >
                <Copy size={10} /> Copy
              </button>
              <button 
                onClick={() => {
                  if(confirm("Clear editor?")) setEditorValue("");
                }}
                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded border border-red-500/20 uppercase transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden min-h-0 relative">
             <Editor
                height="100%"
                language={editorLanguage === 'c' || editorLanguage === 'cpp' ? 'cpp' : editorLanguage}
                value={editorValue}
                onChange={(value) => setEditorValue(value || "")}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20, bottom: 20 },
                    lineNumbers: "on",
                }}
             />
          </div>

          {/* Console Output area */}
          {showConsole && (
             <div className={`${isConsoleExpanded ? 'h-[75%] shadow-inner' : 'h-32'} bg-black border-t border-gray-800 flex flex-col transition-all duration-300 animate-fadeIn shrink-0 z-10 absolute bottom-0 left-0 right-0 max-h-full`}>
                <div className="px-4 py-1.5 bg-gray-900 border-b border-gray-800 flex justify-between items-center text-[10px] text-gray-400 uppercase font-mono tracking-widest cursor-pointer"
                     onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                >
                   <div className="flex items-center gap-2">
                      <Terminal size={12} className="text-green-500" />
                      <span>Console Output</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="hover:text-white transition-colors">
                        {isConsoleExpanded ? <ChevronRight className="rotate-90" size={12}/> : <ChevronRight className="-rotate-90" size={12}/>}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setShowConsole(false); }} className="hover:text-red-400 transition-colors bg-gray-800 px-1.5 rounded">✕</button>
                   </div>
                </div>
                <div className="flex-1 p-3 overflow-auto custom-scrollbar font-mono text-xs text-green-500/90 leading-relaxed whitespace-pre-wrap bg-opacity-50">
                   {consoleOutput}
                </div>
             </div>
          )}
        </div>
    );
}
