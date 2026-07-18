const diagnoses = [
  { severity: "critical", title: "Hardcoded API key in config.js", confidence: "High confidence" },
  { severity: "warning", title: "17 imports resolve to missing files", confidence: "High confidence" },
  { severity: "warning", title: "Test coverage dropped in auth flow", confidence: "Medium confidence" },
] as const;

const severityStyles = {
  critical: "bg-status-critical",
  warning: "bg-status-warning",
} as const;

export function HealthRecordMockup() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:rotate-[2deg]">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" />
      <section className="overflow-hidden rounded-xl border border-accent/35 bg-background-elevated p-4 shadow-2xl shadow-black/50 sm:p-6">
        <header className="flex items-center justify-between gap-3 border-b border-accent/15 pb-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-text-muted">Health record</p>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="truncate font-mono text-base font-semibold text-text-primary">example-app</h2>
              <span className="rounded border border-accent/20 px-2 py-0.5 font-mono text-xs text-text-muted">main</span>
            </div>
          </div>
          <button type="button" className="shrink-0 rounded border border-accent/30 px-3 py-1.5 font-mono text-xs text-accent">Re-examine</button>
        </header>

        <div className="grid gap-5 border-b border-accent/15 py-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-end gap-2"><span className="font-mono text-7xl font-bold leading-none tracking-[-.1em] text-accent">76</span><span className="mb-1 font-mono text-sm text-text-muted">/100</span></div>
          <div><div className="flex justify-between font-mono text-xs uppercase tracking-[.12em] text-text-muted"><span>Health Score</span><span className="text-accent">Improving</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-background"><div className="h-full w-[76%] rounded-full bg-accent shadow-[0_0_16px_rgba(26,192,173,.75)]" /></div><p className="mt-2 font-mono text-xs text-text-muted">Last examined 2 minutes ago</p></div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-accent/15 py-4">
          <div className="rounded border border-status-critical/25 bg-status-critical/10 p-3"><p className="font-mono text-xl font-bold text-status-critical">1</p><p className="font-mono text-xs text-status-critical">Critical</p></div>
          <div className="rounded border border-status-warning/25 bg-status-warning/10 p-3"><p className="font-mono text-xl font-bold text-status-warning">4</p><p className="font-mono text-xs text-status-warning">Warnings</p></div>
          <div className="rounded border border-status-success/25 bg-status-success/10 p-3"><p className="font-mono text-xl font-bold text-status-success">3</p><p className="font-mono text-xs leading-3 text-status-success">Safe Treatments</p></div>
        </div>

        <div className="pt-4"><div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-[.14em] text-text-muted"><span>Active diagnoses</span><span>8 findings</span></div><div className="divide-y divide-accent/10">{diagnoses.map((diagnosis) => <div key={diagnosis.title} className="flex items-center gap-3 py-3.5"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${severityStyles[diagnosis.severity]}`} /><p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{diagnosis.title}</p><span className="shrink-0 font-mono text-xs text-text-muted">{diagnosis.confidence}</span></div>)}</div></div>
      </section>
    </div>
  );
}
