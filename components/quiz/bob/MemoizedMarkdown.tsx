"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MemoizedMarkdownProps {
  content: string;
  isDark: boolean;
}

export const MemoizedMarkdown = React.memo(({ content, isDark }: MemoizedMarkdownProps) => {
  return (
    <div className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { node?: unknown }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                {...props}
                PreTag="div"
                language={match[1]}
                style={isDark ? atomDark : oneLight}
                customStyle={{
                  fontSize: '0.8rem',
                  borderRadius: '0.5rem',
                  marginTop: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={`${className} bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-xs`}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content && prevProps.isDark === nextProps.isDark;
});

MemoizedMarkdown.displayName = 'MemoizedMarkdown';
