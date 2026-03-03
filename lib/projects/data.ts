export interface ProjectChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  files: Record<string, string>;
  activeFile: string;
  solution?: Record<string, string>; // For validation and future features
  validationRegex?: Record<string, string>; // Filename -> Regex pattern to match for success
  validationTests?: Array<{ description: string; test: string }>; // Optional programmatic tests
  hints?: string[];
  estimatedTime?: string; // e.g. "5 mins"
  completionRate?: number; // e.g. 85 for 85%
  expertSolution?: string; // The "Senior Developer" code snippet
  expertExplanation?: string; // Why this solution is better
  readOnlyFiles?: string[]; // Files that should not be editable
  template?:
  | "nextjs"
  | "react"
  | "vanilla"
  | "node"
  | "react-ts"; // Sandpack template to use
  dependencies?: Record<string, string>; // Project-specific dependencies
}

export const projects: ProjectChallenge[] = [
  {
    id: "todo-api-fix",
    title: "Fix the Broken API Route",
    description:
      "The frontend for this Todo app is working perfectly, but the API route is returning a 500 error because of a validation issue. Debug the `api.js` file and fix the POST handler to correctly parse the request body.",
    difficulty: "Medium",
    tags: ["React", "API Simulation", "Debugging"],
    template: "react",
    estimatedTime: "10 mins",
    completionRate: 72,
    dependencies: {
      "react": "18.3.1",
      "react-dom": "18.3.1",
    },
    activeFile: "/api.js",
    readOnlyFiles: ["/App.js", "/index.js"],
    validationRegex: {
      "/api.js": "(?<!JSON\\.parse\\()req\\.body",
    },
    hints: [
      "In modern web frameworks, the request body is often already parsed into an object for you.",
      "Check if you are trying to parse something that is already a JavaScript object.",
      "The `req.body` in this simulation is already an object. Calling `JSON.parse` on it will throw an error!",
    ],
    expertSolution: `export default async function handler(req) {
  if (req.method === 'POST') {
    const { title } = req.body;
    if (!title) return { status: 400, json: { error: 'Title required' } };
    
    todos.push({ title });
    return { status: 201, json: todos };
  }
}`,
    expertExplanation:
      "When the body is already parsed by a middleware (or in this case, the simulation), calling `JSON.parse(req.body)` fails because `req.body` is an object, not a JSON string. Removing the redundant parsing logic fixes the crash.",
    files: {
      "/index.js": `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import handler from "./api";

// --- MOCK API SERVICE ---
window.fetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  
  // Simulate network delay
  await new Promise(r => setTimeout(r, 300));
  
  const response = await handler({ method, body });
  
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.json
  };
};

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      "/App.js": `import { useState, useEffect } from 'react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      if(Array.isArray(data)) setTodos(data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    setError(null);
    try {
      const res = await fetch('/api/todos', {
        method: "POST",
        body: JSON.stringify({ title: input }),
      });
      
      if (res.ok) {
          setInput("");
          fetchTodos();
      } else {
          const errData = await res.json();
          setError(\`Server Error \${res.status}: \${errData.error || "Unknown Error"}\`);
      }
    } catch(err) {
      setError(\`Network Error -> Did the server crash?\`);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Todo Logic Fix</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Try to add a new task. Watch what happens when the API boundary fails.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="e.g. Fix the POST Endpoint"
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}
        />
        <button 
          onClick={addTodo}
          style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Add Task
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          <h4 style={{ margin: "0 0 8px 0" }}>⚠️ The Problem</h4>
          <p style={{ margin: 0 }}>{error}</p>
          <p style={{ margin: "8px 0 0 0", fontSize: '12px' }}>The frontend is functioning perfectly. You need to fix the backend API route so it can parse the request body correctly!</p>
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((t, i) => (
          <li key={i} style={{ padding: '16px', backgroundColor: '#f3f4f6', marginBottom: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
             <span style={{ marginRight: '10px' }}>✅</span> {t.title}
          </li>
        ))}
        {todos.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>No todos yet...</p>}
      </ul>
    </div>
  );
}`,
      "/api.js": `// Simulated Backend Handler
let todos = [{ title: "Learn React Context" }];

export default async function handler(req) {
  if (req.method === 'GET') {
    return { status: 200, json: todos };
  }

  if (req.method === 'POST') {
    // TASK: Fix the POST logic. The 'req.body' is already a JS object!
    try {
        // BUG: Applying JSON.parse to something that isn't a string will crash!
        const body = JSON.parse(req.body); 
        
        if (!body || !body.title) {
            return { status: 400, json: { error: "Title is missing!" } };
        }

        todos.push({ title: body.title });
        return { status: 201, json: todos };
    } catch (err) {
        return { status: 500, json: { error: "Server crashed! Check the logic: is req.body already parsed?" } };
    }
  }
}`,
    },
  },
  {
    id: "react-counter-bug",
    title: "The Impossible Counter",
    description:
      "This counter is supposed to increment by 3 when you click the button, but it only increments by 1. Fix the React state update logic.",
    difficulty: "Easy",
    tags: ["React", "State Management"],
    template: "react",
    estimatedTime: "5 mins",
    completionRate: 85,
    dependencies: {
      react: "18.3.1",
      "react-dom": "18.3.1",
    },
    activeFile: "/App.js",
    readOnlyFiles: [],
    validationRegex: {
      "/App.js": "setCount\\(\\s*\\(?\\s*\\w+\\s*\\)?\\s*=>\\s*\\w+\\s*\\+\\s*\\d+\\)",
    },
    hints: [
      "React state updates are asynchronous and batched for performance.",
      "When you call `setCount(count + 1)` three times, they all see the same initial value of `count`.",
      "To fix this, use the functional update form: `setCount(prev => prev + 1)`.",
    ],
    expertSolution: `const incrementByThree = () => {
  // We use the "Updater Function" pattern (prev => ...)
  // This tells React to queue three separate operations using the LATEST state
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  
  // Note: setCount(prev => prev + 3) also works perfectly and is cleaner,
  // but understanding why THREE separate calls need 'prev' is the key lesson!
};`,
    expertExplanation:
      "React state behaves like a **Snapshot**. Within a single render cycle, the state value is fixed for that specific frame. When you call `setCount(count + 1)` three times, you are effectively telling React: 'Schedule an update to 0+1', 'Schedule an update to 0+1', and 'Schedule an update to 0+1'. React batches these, sees they all target the same goal, and the result is 1.\n\nBy using the **Updater Function** (`prev => prev + 1`), you aren't providing a raw value; you are providing an **instruction**. React places these instructions into a queue and executes them sequentially. The first update takes the current state, the second takes the result of the first, and so on.\n\nThis pattern is critical for:\n1. **Concurrent Rendering**: Where React might interrupt a render to handle a higher-priority task. The queue ensures state consistency when it resumes.\n2. **Avoid Stale Closures**: If your logic is wrapped in a `setTimeout` or an async closure, the variable `count` might be 'stuck' in the past. The updater function always receives the absolute latest committed state.",
    files: {
      "/App.js": `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const incrementByThree = () => {
    // BUG: React state updates are batched!
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "48px", margin: "20px 0" }}>{count}</h1>
      
      <button 
        onClick={incrementByThree}
        style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "8px", marginBottom: "30px" }}
      >
        Increment by 3
      </button>

      <div style={{ padding: "20px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", textAlign: "left" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#991b1b" }}>⚠️ The Problem</h3>
        <p style={{ margin: "0 0 10px 0", color: "#7f1d1d" }}>
          The button above fires <code>setCount(count + 1)</code> three times in a row. 
        </p>
        <ul style={{ margin: 0, color: "#7f1d1d", paddingLeft: "20px" }}>
          <li><b>Expected Behavior:</b> The counter increases by 3.</li>
          <li><b>Actual Behavior:</b> The counter only increases by 1.</li>
        </ul>
      </div>
    </div>
  );
}`,
    },
  },
  {
    id: "slow-list-optimization",
    title: "Optimize the Laggy List",
    description:
      "This filtered list of 800 items renders extremely slowly. Every time you type in the search box, the entire app freezes. Your goal is to optimize the performance so typing feels instant.",
    difficulty: "Hard",
    tags: ["React", "Performance", "Memoization"],
    template: "react",
    estimatedTime: "15 mins",
    completionRate: 45,
    dependencies: {
      react: "18.3.1",
      "react-dom": "18.3.1",
    },
    activeFile: "/App.js",
    readOnlyFiles: [],
    validationRegex: {
      "/App.js": "useMemo\\(|React\\.memo\\(",
    },
    hints: [
      "The expensive filtering logic runs on every single render. You can cache the result using `useMemo`.",
      "Every item in the list re-renders when the parent state changes, even if the item props haven't changed. Try `React.memo`.",
      "Check how often the loop runs. 800 items * every keystroke = Lag.",
    ],
    expertSolution: `import { useState, useMemo, memo } from "react";

// 1. Wrap the child component in React.memo to prevent re-renders
const ListItem = memo(({ item }) => {
  return <div style={styles.item}>{item}</div>;
});

export default function App() {
  const [text, setText] = useState("");
  const [items] = useState(
    Array.from({ length: 800 }, (_, i) => \`Employee \${i + 1}\`)
  );

  // 2. Cache the filtered list with useMemo so it only recalculates when dependencies change
  const filteredItems = useMemo(() => {
    console.log("Filtering...");
    return items.filter(i => i.toLowerCase().includes(text.toLowerCase()));
  }, [items, text]);

  return (
    <div style={styles.container}>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Filter list..."
        style={styles.input}
      />
      <div style={styles.list}>
        {filteredItems.map(item => (
          <ListItem key={item} item={item} />
        ))}
      </div>
    </div>
  );
}`,
    expertExplanation:
      "The original code suffered from two major issues: 1) The expensive filtering operation ran on every render, blocking the main thread. We fixed this with `useMemo`. 2) All 800 list items re-rendered whenever the input state changed. We fixed this by wrapping the `ListItem` component in `React.memo`, ensuring it only updates when its own props change.",
    files: {
      "/App.js": `import { useState } from "react";

// This component re-renders unnecessarily!
const ListItem = ({ item }) => {
  // Simulating an expensive render
  let start = performance.now();
  while(performance.now() - start < 1) {} 
  return <div style={styles.item}>{item}</div>;
};

export default function App() {
  const [text, setText] = useState("");
  const [items] = useState(
    Array.from({ length: 800 }, (_, i) => \`Employee \${i + 1}\`)
  );

  const startRender = performance.now();

  // PERFORMANCE BUG: This entire operation runs on every single render!
  const filteredItems = items.filter(i => 
    i.toLowerCase().includes(text.toLowerCase())
  );

  const renderTime = (performance.now() - startRender).toFixed(1);

  return (
    <div style={styles.container}>
      <h1 style={{margin: "0 0 10px 0"}}>Laggy Directory 🐢</h1>
      
      <div style={{ padding: "16px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>⚠️ The Problem</h4>
        <p style={{ margin: "0 0 8px 0", color: "#7f1d1d", fontSize: '14px' }}>
          Try typing in the search box below. The entire browser freezes because the app is calculating and re-rendering <b>{filteredItems.length}</b> complex components on every keystroke.
        </p>
        <p style={{ margin: 0, color: "#991b1b", fontWeight: "bold" }}>
          Current Filtering Time: {renderTime}ms
        </p>
      </div>

      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Type here to experience the lag..."
        style={styles.input}
      />
      
      <div style={styles.list}>
        {filteredItems.map(item => (
          <ListItem key={item} item={item} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 30, fontFamily: 'system-ui', maxWidth: 600, margin: '0 auto' },
  input: { padding: 12, marginBottom: 20, width: '100%', boxSizing: 'border-box', fontSize: 16, borderRadius: 6, border: '1px solid #ccc' },
  list: { height: 400, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, backgroundColor: '#fafafa' },
  item: { padding: 12, borderBottom: '1px solid #eee' }
};`,
    },
  },
  {
    id: "neumorphic-button",
    title: "Build a Neumorphic Button",
    description:
      "Neumorphism is a design trend that makes UI elements look like they are physically extruding from the background using clever CSS box-shadows. Your task is to add a `boxShadow` to the button's style object so it looks 3D — with a soft light shadow on the top-left and a dark shadow on the bottom-right.",
    difficulty: "Easy",
    tags: ["CSS", "React Styling", "UI/UX"],
    template: "react",
    estimatedTime: "5 mins",
    completionRate: 60,
    dependencies: {
      react: "18.3.1",
      "react-dom": "18.3.1",
    },
    activeFile: "/App.js",
    readOnlyFiles: [],
    validationRegex: {
      "/App.js": "boxShadow\\s*:\\s*[\"']",
    },
    hints: [
      "Neumorphism relies on the background color of the button matching the background color of the page exactly (both `#e0e5ec`).",
      "In React inline styles, the CSS property `box-shadow` becomes `boxShadow` (camelCase).",
      "Try: `boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'`",
    ],
    expertSolution: `export default function App() {
  return (
    <div style={styles.page}>
      <button style={styles.btn}>
        NEUMORPHIC
      </button>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    background: "#e0e5ec",
    fontFamily: "system-ui, sans-serif",
  },
  btn: {
    padding: "18px 48px",
    borderRadius: 30,
    border: "none",
    background: "#e0e5ec",
    color: "#6b7280",
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: 3,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)",
  },
};`,
    expertExplanation:
      "Neumorphism works by simulating a light source hitting a soft surface. The key is using **two shadows** in one `boxShadow` value: a light shadow offset top-left (the light source) and a darker shadow offset bottom-right. Both use large blur values for a soft, diffused look. The background color of the button MUST match the page — that's what creates the seamless 'extruding from the surface' illusion.",
    files: {
      "/App.js": `export default function App() {
  return (
    <div style={styles.page}>

      <div style={styles.problemBox}>
        <h3>\u26a0\ufe0f The Problem</h3>
        <p>
          We want a futuristic Neumorphic button, but right now it looks like 
          a flat, boring gray box. It's almost invisible against the background!
        </p>
        <p style={{ fontSize: 13, marginTop: 8, color: "#888" }}>
          Add a <code style={styles.code}>boxShadow</code> property to <code style={styles.code}>styles.btn</code> below.
        </p>
      </div>

      <button style={styles.btn}>CLICK ME</button>

    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    background: "#e0e5ec",
    fontFamily: "system-ui, sans-serif",
    gap: 40,
  },
  problemBox: {
    maxWidth: 400,
    textAlign: "center",
    color: "#555",
  },
  code: {
    background: "rgba(0,0,0,0.08)",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 13,
  },
  btn: {
    padding: "16px 40px",
    borderRadius: 16,
    border: "none",
    background: "#e0e5ec",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 2,
    cursor: "pointer",
    transition: "all 0.3s ease",
    // ADD YOUR boxShadow HERE to create the neumorphic effect!
    // Hint: You need two shadows separated by a comma, in one string
  },
};`,
    },
  },
  {
    id: "use-debounce-hook",
    title: "Implement a useDebounce Hook",
    description:
      "When building search bars, you don't want to hit your API on every single keystroke. Instead, you should 'debounce' the user's input, waiting until they've stopped typing for a brief period before triggering the search. Complete the `useDebounce` hook implementation.",
    difficulty: "Medium",
    tags: ["React", "Custom Hooks", "Performance"],
    template: "react",
    estimatedTime: "15 mins",
    completionRate: 55,
    dependencies: {
      react: "18.3.1",
      "react-dom": "18.3.1",
    },
    activeFile: "/useDebounce.js",
    readOnlyFiles: ["/App.js"],
    validationRegex: {
      "/useDebounce.js": "setTimeout|clearTimeout",
    },
    hints: [
      "You need a piece of local state inside the hook to hold the 'debounced' value.",
      "Use a `useEffect` that listens to changes on the incoming `value` prop.",
      "Inside the effect, set a timeout to update the local state, but make sure to *clear* the timeout in the effect's cleanup function!",
    ],
    expertSolution: `import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // Cleanup: clear the timer if the value changes before the delay finishes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}`,
    expertExplanation:
      "This is the classic, robust implementation of `useDebounce`. It relies on React's `useEffect` cleanup function. Whenever the `value` changes (the user types a letter), the old effect is cleaned up first. The `clearTimeout` cancels the pending state update, and a new timer is started. Only when the user stops typing for the full `delay` duration will the timer successfully fire and update the `debouncedValue` state, which then cascades down to trigger the expensive API call.",
    files: {
      "/App.js": `import React, { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Use the custom hook (make sure it works!)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 2. This effect only runs when the DEBOUNCED term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      // FAKE API CALL
      setTimeout(() => {
        setResults([\`Result 1 for \${debouncedSearchTerm}\`, \`Result 2 for \${debouncedSearchTerm}\`]);
        setIsSearching(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div style={{ padding: 30, fontFamily: 'system-ui', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{margin: "0 0 10px 0"}}>Search Users (Debounced)</h2>
      
      <div style={{ padding: "16px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>⚠️ The Problem</h4>
        <p style={{ margin: "0 0 8px 0", color: "#7f1d1d", fontSize: '14px' }}>
          Type quickly in the search box below. Notice how the <span style={{backgroundColor: "white", padding: "2px 4px", borderRadius: "4px"}}>Debounced API Query</span> at the bottom exactly matches your typing in real-time. This means we are hitting our server 10 times for the word "HelloWorld"!
        </p>
        <p style={{ margin: 0, color: "#7f1d1d", fontSize: '14px' }}>
          <b>Expected:</b> The debounced value should only update when you STOP typing.
        </p>
      </div>

      <input
        type="text"
        placeholder="Type to search..."
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: 12, width: "100%", fontSize: 16, boxSizing: "border-box", borderRadius: 6, border: "1px solid #ccc" }}
      />
      
      <div style={{ marginTop: 20, minHeight: 60 }}>
        {isSearching && <div style={{color: '#666'}}>Searching API...</div>}
        <ul style={{paddingLeft: 20}}>
          {results.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div style={{ padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "8px", marginTop: "40px", fontSize: "14px" }}>
         <div style={{ marginBottom: "8px" }}>
          Real-time input: <strong style={{color: '#2563eb', fontSize: '18px'}}>{searchTerm || "..."}</strong>
         </div>
         <div>
          Debounced API Query: <strong style={{color: '#d97706', fontSize: '18px'}}>{debouncedSearchTerm || "..."}</strong>
         </div>
      </div>
    </div>
  );
}`,
      "/useDebounce.js": `import { useState, useEffect } from "react";

export function useDebounce(value, delay) {
  // 1. Create a state variable to hold the delayed value
  
  // 2. Create an effect that listens to 'value' and 'delay'
  
  // 3. Inside the effect, set a timeout to update the state variable
  
  // 4. CRITICAL: Don't forget the cleanup function to clear the timeout!
  
  return value; // FIX ME: Should return the debounced state variable, not the raw value
}`,
    },
  },
  {
    id: "vanilla-dom-bug",
    title: "Fix the DOM Manipulation Bug",
    description:
      "You need to build a simple vanilla JavaScript todo app that adds items to a list dynamically. The HTML is provided, but the JavaScript is broken. Fix it to add items to the DOM when the button is clicked.",
    difficulty: "Easy",
    tags: ["Vanilla JS", "DOM API", "Event Handling"],
    template: "vanilla",
    estimatedTime: "8 mins",
    completionRate: 78,
    activeFile: "/script.js",
    readOnlyFiles: ["/index.html"],
    validationRegex: {
      "/script.js": "addEventListener|addEventListener.*click|appendChild|insertAdjacentHTML",
    },
    hints: [
      "You need to get a reference to the HTML elements using `document.querySelector()` or `getElementById()`.",
      "Add an event listener to the button that triggers when it's clicked.",
      "When the button is clicked, create a new list item and append it to the list using `appendChild()` or `innerHTML`.",
    ],
    expertSolution: `const input = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const list = document.querySelector('#todo-list');

addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.textContent = text;
  list.appendChild(li);
  
  input.value = '';
  input.focus();
});`,
    expertExplanation:
      "The key is using the DOM API correctly: `querySelector()` to find elements, `addEventListener()` to respond to events, and `appendChild()` or `createElement()` to modify the DOM. Always validate user input before using it.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; padding: 20px; }
    #todo-input { padding: 8px; width: 200px; }
    #add-btn { padding: 8px 16px; cursor: pointer; background: #000; color: #fff; border: none; }
    #todo-list { margin-top: 20px; list-style: none; padding: 0; }
    #todo-list li { padding: 12px; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <h2>My Todos</h2>
  <input id="todo-input" placeholder="Enter a todo...">
  <button id="add-btn">Add</button>
  <ul id="todo-list"></ul>
  <script src="script.js"></script>
</body>
</html>`,
      "/script.js": `// TASK: Make the "Add" button work!
// When clicked, it should take the input value and add it to the list.

const input = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const list = document.querySelector('#todo-list');

// TODO: Add an event listener to addBtn that:
// 1. Gets the input value
// 2. Creates a new <li> element
// 3. Sets the li's text to the input value
// 4. Appends it to the list`,
    },
  },
  {
    id: "flexbox-layout",
    title: "Build a Responsive Flexbox Layout",
    description:
      "Create a responsive header layout using CSS Flexbox. The HTML structure is provided. You only need to add the CSS to make the header flex, center items vertically, and respond to mobile screens.",
    difficulty: "Easy",
    tags: ["CSS", "Flexbox", "Responsive Design"],
    template: "vanilla",
    estimatedTime: "7 mins",
    completionRate: 82,
    activeFile: "/style.css",
    readOnlyFiles: ["/index.html"],
    validationRegex: {
      "/style.css": "display:\\s*flex|flex-direction|justify-content|align-items",
    },
    hints: [
      "Use `display: flex` on the container to enable flexbox.",
      "Use `justify-content` to align items horizontally (e.g., `space-between`).",
      "Use `align-items: center` to center items vertically.",
      "Use `@media` queries or `flex-wrap` for mobile responsiveness.",
    ],
    expertSolution: `header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
  gap: 20px;
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    text-align: center;
  }
}`,
    expertExplanation:
      "Flexbox is the modern way to layout elements. `display: flex` activates it, `justify-content` controls horizontal alignment, and `align-items` controls vertical alignment. Media queries let you adjust for mobile.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <div class="logo">MyApp</div>
    <nav>
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
    <button>Sign In</button>
  </header>
  
  <main>
    <h1>Welcome</h1>
    <p>The header above should use Flexbox to align elements horizontally on desktop, and stack vertically on mobile.</p>
  </main>
</body>
</html>`,
      "/style.css": `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
}

header {
  /* FIX ME: Make this a flexbox container that:
     1. Displays items in a row (desktop)
     2. Distributes them evenly with space-between
     3. Centers items vertically
     4. On mobile (max-width: 768px), stacks vertically
  */
  background: #f5f5f5;
  padding: 20px;
}

nav {
  /* Also make nav a flex container to align links horizontally */
  display: flex;
  gap: 20px;
}

nav a {
  text-decoration: none;
  color: #333;
}

button {
  padding: 8px 16px;
  background: #000;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

main {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}`,
    },
  },
  {
    id: "tsreact-generic-types",
    title: "Build a Generic Type-Safe List Component",
    description:
      "Build a reusable React component in TypeScript that accepts a generic array and renders it. The component should be type-safe and only accept valid props.",
    difficulty: "Medium",
    tags: ["TypeScript", "React", "Generics"],
    template: "react-ts",
    estimatedTime: "12 mins",
    completionRate: 52,
    activeFile: "/App.tsx",
    readOnlyFiles: [],
    validationRegex: {
      "/App.tsx": "<T extends|generic|interface Props|Record<string",
    },
    hints: [
      "Define a generic component that accepts a type parameter T for the array items.",
      "Use an interface or type to define the props, making it reusable.",
      "Map over the array to render each item.",
    ],
    expertSolution: `interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  return (
    <List
      items={users}
      renderItem={(user) => user.name}
      keyExtractor={(user) => user.id}
    />
  );
}`,
    expertExplanation:
      "Generic components let you create reusable UI that works with any data type while maintaining type safety. This pattern is used in libraries like TanStack Query and React Table.",
    files: {
      "/App.tsx": `import React from 'react';

// TODO: Create a generic List component that accepts:
// - items: an array of any type T
// - renderItem: a function to render each item
// - keyExtractor: a function to extract unique keys

// Then use it in the App component below to render a list of users
// (Make sure it's fully type-safe!)

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
];

export default function App() {
  return (
    <div style={{ padding: 40 }}>
      <h1>User List (Type-Safe with Generics)</h1>
      {/* TODO: Render the list here */}
    </div>
  );
}`,
    },
  },
];

