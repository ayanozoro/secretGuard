import React, { useState } from "react";

/**
 * SecretGuard Code Details & Remediation Side Panel
 * Displayed side-by-side with Findings in the dashboard split-view
 */
export default function CodeDetailsPanel({
  finding,
  onClose = () => {},
  onUpdateStatus = () => {}
}) {
  const [checklist, setChecklist] = useState({
    0: false,
    1: false,
    2: false,
    3: false
  });

  const toggleCheck = (idx) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!finding) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#101726]/80 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Finding Selected</h4>
        <p className="text-xs text-slate-400 max-w-xs">
          Select any secret leak from the findings table to inspect code context and remediation actions.
        </p>
      </div>
    );
  }

  // Generate realistic snippet lines around the finding
  const lineNumber = finding.line || 8;
  const snippetLines = [
    { num: Math.max(1, lineNumber - 3), code: `export default function initClientConfig() {` },
    { num: Math.max(1, lineNumber - 2), code: `  const environment = process.env.NODE_ENV || 'production';` },
    { num: Math.max(1, lineNumber - 1), code: `  // Authenticate security provider credentials` },
    {
      num: lineNumber,
      code: finding.snippet ? finding.snippet : `  const ${finding.type?.toLowerCase().includes("key") ? "apiKey" : "secretToken"} = "${finding.maskedSecret}";`,
      isHighlighted: true
    },
    { num: lineNumber + 1, code: `  return new ClientService({ token: ${finding.type?.toLowerCase().includes("key") ? "apiKey" : "secretToken"} });` },
    { num: lineNumber + 2, code: `}` }
  ];

  const remediationTasks = [
    `Revoke exposed ${finding.type || "secret"} immediately in provider dashboard`,
    "Invalidate active user sessions & rotate associated credentials",
    "Purge credential from Git commit history using git-filter-repo",
    "Add pattern to pre-commit hook and repository .gitignore"
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#101726]/80 flex flex-col h-full shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Code Details
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {finding.ruleName || "Secret Match"}
          </span>
        </div>

        <button
          onClick={onClose}
          title="Close Details Panel"
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Terminal Code Window */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-3 py-2 rounded-t-xl bg-[#080C14] border border-white/10 border-b-0 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-bold text-slate-300">Terminal</span>
          </div>
          <span className="text-slate-400 truncate max-w-[200px]" title={finding.filePath}>
            {finding.filePath}:{finding.line}
          </span>
        </div>

        <div className="bg-[#050810] border border-white/10 rounded-b-xl p-3 font-mono text-xs overflow-x-auto">
          {snippetLines.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-baseline gap-3 py-0.5 px-1.5 rounded transition-colors ${
                line.isHighlighted ? "bg-red-500/15 border-l-2 border-red-400" : ""
              }`}
            >
              <span className={`text-[11px] select-none w-6 text-right font-mono ${
                line.isHighlighted ? "text-red-400 font-bold" : "text-slate-600"
              }`}>
                {line.num}
              </span>
              <span className={`flex-1 whitespace-pre ${
                line.isHighlighted ? "text-red-200 font-bold" : "text-slate-300"
              }`}>
                {line.isHighlighted ? (
                  <span>
                    {line.code.split(finding.maskedSecret)[0]}
                    <span className="px-1.5 py-0.5 rounded bg-red-500/25 text-red-300 border border-red-500/40 font-bold tracking-wider">
                      {finding.maskedSecret}
                    </span>
                    {line.code.split(finding.maskedSecret)[1] || ""}
                  </span>
                ) : (
                  line.code
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Remediation Checklist */}
      <div className="mb-5 flex-1">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Remediation Checklist</span>
          <span className="text-[10px] font-mono font-normal text-slate-400">
            {Object.values(checklist).filter(Boolean).length} / {remediationTasks.length} Completed
          </span>
        </h4>

        <div className="space-y-2">
          {remediationTasks.map((task, idx) => (
            <label
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                checklist[idx]
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 line-through opacity-80"
                  : "bg-black/20 border-white/5 text-slate-300 hover:border-white/15 hover:bg-black/30"
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(checklist[idx])}
                onChange={() => {}}
                className="mt-0.5 rounded border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
              />
              <span className="leading-tight">{task}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Triage Actions */}
      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
        {finding.status === "OPEN" ? (
          <>
            <button
              onClick={() => onUpdateStatus(finding.id, "RESOLVED", "Remediated in provider and history purged")}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              ✓ Mark Resolved
            </button>
            <button
              onClick={() => onUpdateStatus(finding.id, "FALSE_POSITIVE", "Verified test token")}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              False Positive
            </button>
          </>
        ) : (
          <button
            onClick={() => onUpdateStatus(finding.id, "OPEN", "Reopened for verification")}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            ↺ Reopen Finding
          </button>
        )}
      </div>

    </div>
  );
}
