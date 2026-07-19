type DiagnosisReportCardProps = {
  diagnosisId: string;
  title: string;
  severity: "Critical" | "Warning";
  confidence: string;
  affectedFiles: readonly string[];
  evidence: string;
  whyItMatters: string;
  className?: string;
};

const severityStyles = {
  Critical: "bg-status-critical/15 text-status-critical",
  Warning: "bg-status-warning/15 text-status-warning",
} as const;

export function DiagnosisReportCard({
  diagnosisId,
  title,
  severity,
  confidence,
  affectedFiles,
  evidence,
  whyItMatters,
  className = "",
}: DiagnosisReportCardProps) {
  return (
    <article className={`rounded-lg border border-accent/20 bg-background p-6 shadow-2xl shadow-black/20 sm:p-9 ${className}`}>
      <div className="flex flex-col justify-between gap-5 border-b border-accent/15 pb-6 sm:flex-row">
        <div>
          <p className="font-mono text-xs text-text-muted">DIAGNOSIS / {diagnosisId}</p>
          <h3 className="mt-2 text-2xl font-bold">{title}</h3>
        </div>
        <div className="flex gap-2">
          <span className={`h-fit rounded-full px-3 py-1 font-mono text-xs ${severityStyles[severity]}`}>{severity.toUpperCase()}</span>
          <span className="h-fit rounded-full border border-accent/20 px-3 py-1 font-mono text-xs text-accent">{confidence}</span>
        </div>
      </div>
      <div className="grid gap-8 py-7 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs text-text-muted">AFFECTED FILES</p>
          <ul className="mt-3 space-y-2 font-mono text-sm">
            {affectedFiles.map((file) => <li key={file}>{file}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs text-text-muted">EVIDENCE</p>
          <p className="mt-3 text-sm leading-6 text-text-muted">{evidence}</p>
        </div>
      </div>
      <div className="border-t border-accent/15 pt-5">
        <p className="font-mono text-xs text-accent">WHY IT MATTERS</p>
        <p className="mt-2 leading-7 text-text-muted">{whyItMatters}</p>
      </div>
    </article>
  );
}
