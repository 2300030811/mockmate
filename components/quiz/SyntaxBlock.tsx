"use client";

import { memo, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

// Dynamically import the syntax highlighter and its languages to massively 
// reduce the main JavaScript bundle size and improve initial page load.
const LazyHighlighter = dynamic(
  async () => {
    const { PrismLight } = await import('react-syntax-highlighter');
    
    // Parallel import language syntaxes
    const [python, java, javascript, json, sql] = await Promise.all([
      import('react-syntax-highlighter/dist/esm/languages/prism/python').then(m => m.default),
      import('react-syntax-highlighter/dist/esm/languages/prism/java').then(m => m.default),
      import('react-syntax-highlighter/dist/esm/languages/prism/javascript').then(m => m.default),
      import('react-syntax-highlighter/dist/esm/languages/prism/json').then(m => m.default),
      import('react-syntax-highlighter/dist/esm/languages/prism/sql').then(m => m.default),
    ]);
    
    PrismLight.registerLanguage('python', python);
    PrismLight.registerLanguage('java', java);
    PrismLight.registerLanguage('javascript', javascript);
    PrismLight.registerLanguage('json', json);
    PrismLight.registerLanguage('sql', sql);

    return { default: PrismLight };
  },
  { 
    ssr: false, 
    loading: () => (
      <div className="p-8 animate-pulse bg-[#f3f4f6] dark:bg-[#1e1e1e] font-mono text-sm text-gray-500 dark:text-gray-400">
        Loading Code Snippet...
      </div>
    ) 
  }
);

interface SyntaxBlockProps {
    code: string;
    language: string;
    isDark?: boolean;
}

const SUPPORTED_LANGUAGES = new Set(['java', 'python', 'json', 'sql', 'javascript']);

export const SyntaxBlock = memo(function SyntaxBlock({ code, language, isDark = true }: SyntaxBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lang = useMemo(() => {
        const rawLang = language?.toLowerCase() || '';
        return SUPPORTED_LANGUAGES.has(rawLang) ? rawLang : 'javascript';
    }, [language]);

    // Memoize the inline styles to prevent unnecessary react-syntax-highlighter re-renders
    const customStyle = useMemo(() => ({
        margin: 0,
        padding: '1.25rem 1.5rem',
        fontSize: '14px',
        lineHeight: '1.6',
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff'
    }), [isDark]);

    const lineStyle = useMemo(() => ({
        minWidth: "2.5em",
        paddingRight: "1em",
        opacity: 0.3,
        textAlign: 'right' as const
    }), []);

    return (
        <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10">
            {/* Window Header */}
            <div className={`flex items-center px-4 py-3 ${isDark ? 'bg-[#1e1e1e] border-b border-white/5' : 'bg-gray-100 border-b border-gray-200'} gap-2`}>
                <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        {lang}
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
            
            <LazyHighlighter 
                language={lang} 
                style={isDark ? vscDarkPlus : vs}
                customStyle={customStyle}
                showLineNumbers={true}
                lineNumberStyle={lineStyle}
            >
                {code}
            </LazyHighlighter>
        </div>
    );
});
