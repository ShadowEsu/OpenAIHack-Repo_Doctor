"use client";

import { cn } from "@/lib/utils";

interface CodeSnippetProps {
  code: string;
  language?: string;
  highlighted?: [number, number][];
}

export function CodeSnippet({ code, language, highlighted }: CodeSnippetProps) {
  const lines = code.split("\n");

  const isHighlighted = (lineIndex: number) => {
    if (!highlighted) return false;
    const lineNum = lineIndex + 1;
    return highlighted.some(([start, end]) => lineNum >= start && lineNum <= end);
  };

  return (
    <div className="rounded-xl border border-strong bg-surface overflow-hidden">
      {language && (
        <div className="border-b border-strong px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-text-muted">
          {language}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {lines.map((line, i) => (
              <tr
                key={i}
                className={cn(
                  "transition-colors",
                  isHighlighted(i) && "bg-accent-light"
                )}
              >
                <td className="w-12 shrink-0 px-3 py-0.5 text-right text-xs text-text-muted select-none border-r border-strong">
                  {i + 1}
                </td>
                <td className="px-4 py-0.5 text-xs font-mono text-text-secondary whitespace-pre">
                  {line || "\u00A0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
