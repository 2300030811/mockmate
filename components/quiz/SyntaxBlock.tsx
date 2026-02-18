"use client";

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Register only needed languages to reduce bundle size
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);

interface SyntaxBlockProps {
    code: string;
    language: string;
    isDark?: boolean;
}

export function SyntaxBlock({ code, language, isDark = true }: SyntaxBlockProps) {
    // Basic normalization for language names
    const lang = language.toLowerCase() === 'java' ? 'java' : 
                 language.toLowerCase() === 'python' ? 'python' :
                 language.toLowerCase() === 'json' ? 'json' : 'javascript';

    return (
        <SyntaxHighlighter 
            language={lang} 
            style={isDark ? vscDarkPlus : vs}
            customStyle={{
                margin: 0,
                padding: '1.5rem',
                fontSize: '0.95rem',
                backgroundColor: isDark ? '#09090b' : '#f8f9fa'
            }}
            showLineNumbers={true}
            lineNumberStyle={{ minWidth: "2em", paddingRight: "1em", opacity: 0.3 }}
        >
            {code}
        </SyntaxHighlighter>
    );
}

