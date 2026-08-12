import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ArabicExplanationProps = {
  text: string;
};

// Content mixes Arabic prose with inline German terms marked as **bold** or
// `code` -- but bold is also used for plain Arabic emphasis and backtick
// spans aren't guaranteed to always be German either, so detect German
// terms by script rather than by markup alone: a run counts as German only
// if it contains at least one Latin letter AND no Arabic letters. Requiring
// a Latin letter (not just "no Arabic") avoids miscoloring bare numbers,
// punctuation, or other non-Arabic scripts as German.
function isGermanTerm(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  const hasArabic = /[؀-ۿ]/.test(trimmed);
  const hasLatinLetter = /[A-Za-zÄÖÜäöüß]/.test(trimmed);
  return hasLatinLetter && !hasArabic;
}

function textContent(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
    .join("");
}

export function ArabicExplanation({ text }: ArabicExplanationProps) {
  return (
    <div
      dir="rtl"
      className="space-y-3 text-right text-base leading-relaxed text-blue-700 dark:text-blue-300"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => {
            const content = textContent(children);
            if (isGermanTerm(content)) {
              return (
                <strong
                  dir="ltr"
                  className="mx-1 inline-block font-bold text-red-600 dark:text-red-400"
                >
                  {children}
                </strong>
              );
            }
            return <strong className="font-bold text-blue-900 dark:text-blue-100">{children}</strong>;
          },
          code: ({ children }) => {
            const content = textContent(children);
            if (isGermanTerm(content)) {
              return (
                <code
                  dir="ltr"
                  className="mx-1 inline-block rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-700 dark:bg-red-950/50 dark:text-red-400"
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="mx-1 inline-block rounded bg-muted px-1.5 py-0.5 text-sm">
                {children}
              </code>
            );
          },
          del: ({ children }) => <del className="opacity-70">{children}</del>,
          blockquote: ({ children }) => (
            <blockquote className="rounded-md border-r-4 border-blue-400 bg-blue-100/50 p-3 dark:border-blue-700 dark:bg-blue-950/30">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-blue-200 bg-blue-100/50 p-2 text-right dark:border-blue-800 dark:bg-blue-900/30">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-blue-200 p-2 text-right dark:border-blue-800">{children}</td>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pr-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pr-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
