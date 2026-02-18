export interface ProjectChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  files: Record<string, string>;
  activeFile: string;
  solution?: Record<string, string>; // For validation later
  validationRegex?: Record<string, string>; // Filename -> Regex pattern to match for success
  hints?: string[];
  estimatedTime?: string; // e.g. "5 mins"
  completionRate?: number; // e.g. 85 for 85%
  expertSolution?: string; // The "Senior Developer" code snippet
  expertExplanation?: string; // Why this solution is better
  readOnlyFiles?: string[]; // Files that should not be editable
}

export const projects: ProjectChallenge[] = [
  {
    id: "todo-api-fix",
    title: "Fix the Broken API Route",
    description: "The frontend for this Todo app is working perfectly, but the API route is returning a 500 error because of a validation issue. Debug the `route.ts` file and fix the POST handler to correctly parse the request body.",
    difficulty: "Medium",
    tags: ["Next.js", "API Routes", "Debugging"],
    estimatedTime: "10 mins",
    completionRate: 72,
    activeFile: "/app/api/todos/route.ts",
    readOnlyFiles: ["/app/page.tsx"],
    validationRegex: {
        "/app/api/todos/route.ts": "await\\s+request\\.json\\(\\)"
    },
    hints: [
        "In the standard Web Request API (used by Next.js App Router), `request.body` is a ReadableStream, not a JSON object.",
        "You need to asynchronously parse the body to get the JSON data.",
        "Try using `const body = await request.json();`"
    ],
    expertSolution: `export async function POST(request: Request) {
  try {
    const body = await request.json(); // <--- Correctly parse the JSON body
    
    if (!body || !body.title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    todos.push({ title: body.title });
    return NextResponse.json(todos);
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}`,
    expertExplanation: "The original code tried to access `request.body` directly, but in the Fetch API (which Next.js App Router uses), the body is a readable stream. You must use `await request.json()` to parse it. Also, wrapping it in a try-catch block is a best practice to handle malformed JSON gracefully.",
    files: {
      "/app/page.tsx": `import { useState, useEffect } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const fetchTodos = async () => {
    const res = await fetch('/api/todos');
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    const res = await fetch('/api/todos', {
      method: "POST",
      body: JSON.stringify({ title: input }),
    });
    if (res.ok) {
        setInput("");
        fetchTodos();
    } else {
        alert("Failed to add todo");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Todo Logic Fix</h1>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="New todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((t: any, i) => (
          <li key={i}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}`,
      "/app/api/todos/route.ts": `import { NextResponse } from "next/server";

let todos = [{ title: "Learn Next.js" }];

export async function GET() {
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  // BUG: The request body is not being parsed correctly!
  // It tries to read 'request.body.title' directly which is undefined in standard Request API
  
  const body = request.body; // <--- This behaves like a stream in standard Web API
  
  if (!body || !body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  todos.push({ title: body.title });
  
  return NextResponse.json(todos);
}`
    }
  },
  {
      id: "react-counter-bug",
      title: "The Impossible Counter",
      description: "This counter is supposed to increment by 3 when you click the button, but it only increments by 1. Fix the React state update logic.",
      difficulty: "Easy",
      tags: ["React", "State Management"],
      estimatedTime: "5 mins",
      completionRate: 85,
    activeFile: "/App.js",
    readOnlyFiles: [],
    validationRegex: {
          "/App.js": "setCount\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*\\+\\s*1\\)"
      },
      hints: [
          "React state updates are asynchronous and batched for performance.",
          "When you call `setCount(count + 1)` three times, they all see the same initial value of `count`.",
          "To fix this, use the functional update form: `setCount(prev => prev + 1)`."
      ],
      expertSolution: `const incrementByThree = () => {
  // Use the "Functional Update" pattern
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
};`,
     expertExplanation: "React batches state updates for performance. When you call `setCount(count + 1)` multiple times, they all use the stale value of `count` from the current render cycle. By using the callback form `setCount(prev => prev + 1)`, you ensure each update receives the most up-to-date state from the previous update in the batch.",
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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Count: {count}</h1>
      <button onClick={incrementByThree}>Increment by 3</button>
      <p>Result should be current + 3, but getting + 1</p>
    </div>
  );
}`
      }
  },
  {
      id: "slow-list-optimization",
      title: "Optimize the Laggy List",
      description: "This filtered list of 5,000 items renders extremely slowly. Every time you type in the search box, the entire app freezes. Your goal is to optimize the performance so typing feels instant.",
      difficulty: "Hard",
      tags: ["React", "Performance", "Memoization"],
      estimatedTime: "15 mins",
      completionRate: 45,
    activeFile: "/App.js",
    readOnlyFiles: [],
    validationRegex: {
          "/App.js": "useMemo\\(|React\\.memo\\("
      },
      hints: [
          "The expensive filtering logic runs on every single render. You can cache the result using `useMemo`.",
          "Every item in the list re-renders when the parent state changes, even if the item props haven't changed. Try `React.memo`.",
          "Check how often the loop runs. 5000 items * every keystroke = Lag."
      ],
      expertSolution: `import { useState, useMemo, memo } from "react";

// 1. Wrap the child component in React.memo to prevent re-renders
const ListItem = memo(({ item }) => {
  return <div style={styles.item}>{item}</div>;
});

export default function App() {
  const [text, setText] = useState("");
  const [items] = useState(
    Array.from({ length: 5000 }, (_, i) => \`Item \${i + 1}\`)
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
      expertExplanation: "The original code suffered from two major issues: 1) The expensive filtering operation ran on every render, blocking the main thread. We fixed this with `useMemo`. 2) All 5,000 list items re-rendered whenever the input state changed. We fixed this by wrapping the `ListItem` component in `React.memo`, ensuring it only updates when its own props change.",
      files: {
          "/App.js": `import { useState } from "react";

// This component re-renders unnecessarily!
const ListItem = ({ item }) => {
  return <div style={styles.item}>{item}</div>;
};

export default function App() {
  const [text, setText] = useState("");
  const [items] = useState(
    Array.from({ length: 5000 }, (_, i) => \`Item \${i + 1}\`)
  );

  // PERFORMANCE BUG: This runs on every render!
  const filteredItems = items.filter(i => 
    i.toLowerCase().includes(text.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h1>Laggy List 🐢</h1>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Type here (slow)..."
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
  container: { padding: 20, fontFamily: 'sans-serif' },
  input: { padding: 10, marginBottom: 20, width: '100%', fontSize: 16 },
  list: { height: 400, overflowY: 'auto', border: '1px solid #ccc' },
  item: { padding: 10, borderBottom: '1px solid #eee' }
};`
      }
  }
];
