"use client";

import { useRef, useState } from "react";

const clampPosition = (value: number) => Math.min(100, Math.max(0, value));

function CodeSnippet({ version }: { version: "before" | "after" }) {
  const isBefore = version === "before";

  return (
    <pre className="m-0 overflow-hidden font-mono text-xs leading-6 text-text-primary sm:text-sm">
      <code>
        <span className="text-text-muted">{"// config/api.ts"}</span>{"\n"}
        <span className="text-accent">export const</span> <span className="text-text-primary">apiConfig</span> <span className="text-text-muted">=</span> <span className="text-text-primary">&#123;</span>{"\n"}
        {isBefore ? (
          <>
            {"  "}<span className="text-text-muted">apiKey:</span> <span className="text-status-critical">&quot;sk_live_7f3a...&quot;</span>,{"\n"}
            {"  "}<span className="text-text-muted">baseUrl:</span> <span className="text-status-warning">&quot;https://api.example.com&quot;</span>,{"\n"}
          </>
        ) : (
          <>
            {"  "}<span className="text-text-muted">apiKey:</span> <span className="text-status-success">process.env.REPO_DOCTOR_API_KEY</span>,{"\n"}
            {"  "}<span className="text-text-muted">baseUrl:</span> <span className="text-status-warning">process.env.API_BASE_URL</span>,{"\n"}
          </>
        )}
        <span className="text-text-primary">&#125;;</span>
      </code>
    </pre>
  );
}

export function XraySlider() {
  const [position, setPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = (clientX: number) => {
    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setPosition(clampPosition(((clientX - bounds.left) / bounds.width) * 100));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 5;
    let nextPosition: number | null = null;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextPosition = position - step;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") nextPosition = position + step;
    if (event.key === "Home") nextPosition = 0;
    if (event.key === "End") nextPosition = 100;

    if (nextPosition !== null) {
      event.preventDefault();
      setPosition(clampPosition(nextPosition));
    }
  };

  return (
    <figure className="rounded-xl border border-accent/25 bg-background p-4 shadow-2xl shadow-black/20 sm:p-5">
      <div ref={sliderRef} className="relative isolate min-h-56 overflow-hidden rounded-lg border border-accent/15 bg-background-elevated sm:min-h-64">
        <div className="absolute inset-0 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full bg-status-critical/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.14em] text-status-critical">Before</span>
            <span className="rounded-full bg-status-success/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.14em] text-status-success">After</span>
          </div>
          <CodeSnippet version="after" />
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 overflow-hidden border-r border-status-critical/70 bg-background-elevated" style={{ width: `${position}%` }}>
          <div className="min-w-[18rem] p-5 sm:min-w-[22rem] sm:p-6">
            <div className="mb-5">
              <span className="rounded-full bg-status-critical/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.14em] text-status-critical">Before</span>
            </div>
            <CodeSnippet version="before" />
          </div>
        </div>

        <div
          aria-label="Before and after code comparison divider"
          aria-orientation="horizontal"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% before code visible`}
          className="absolute inset-y-0 z-20 flex w-11 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          role="slider"
          style={{ left: `${position}%` }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPointer(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event.clientX);
          }}
        >
          <span className="flex h-10 w-7 items-center justify-center rounded-full border border-accent bg-background-elevated shadow-lg shadow-accent/20 transition-transform duration-150 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent">
            <span aria-hidden="true" className="flex gap-1">
              <span className="h-4 w-px bg-accent" />
              <span className="h-4 w-px bg-accent" />
            </span>
          </span>
        </div>
      </div>
      <figcaption className="mt-4 font-mono text-xs leading-5 text-text-muted">Same file, before and after a Repo Doctor treatment.</figcaption>
    </figure>
  );
}
