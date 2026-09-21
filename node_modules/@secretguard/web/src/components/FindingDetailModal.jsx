import React, { useState } from "react";

/**
 * Finding Detail & Triage Modal
 * Shows code snippet with line numbers, masked secret highlight, and actionable remediation steps.
 */
export default function FindingDetailModal({
  finding,
  isOpen = false,
  onClose = () => {},
  onUpdateStatus = () => {}
}) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [checklist, setChecklist] = useState({});

  if (!isOpen || !finding) return null;

  const handleToggleCheck = (index) => {
    setChecklist(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(finding.id, newStatus, resolutionNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-3xl rounded-2xl border border-white/15 bg-[#111827] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-white/10 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`badge-severity ${finding.severity?.toLowerCase()}`}>
                {finding.severity}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {finding.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {finding.ruleName}
            </h3>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">
              {finding.filePath}:{finding.line}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* Code Terminal Snippet */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Code Context (Zero-Plaintext Policy)
            </h4>
            <div className="code-terminal">
              <div className="code-terminal-header">
                <div className="code-terminal-dots">
                  <span style={{ background: "#EF4444" }} />
                  <span style={{ background: "#F59E0B" }} />
                  <span style={{ background: "#10B981" }} />
                </div>
                <span>{finding.filePath}:{finding.line}</span>
                <span className="font-mono text-[11px] text-slate-400">Line {finding.line}</span>
              </div>
              <div className="code-terminal-content">
                <div className="code-line">
                  <span className="code-line-number">{Math.max(1, (finding.line || 1) - 1)}</span>
                  <span className="code-line-text text-slate-500">// SecretGuard scanner match</span>
                </div>
                <div className="code-line bg-red-500/10 py-1">
                  <span className="code-line-number text-red-400 font-bold">{finding.line || 1}</span>
                  <span className="code-line-text">
                    {finding.snippet ? (
                      finding.snippet
                    ) : (
                      <span>
                        secret = "<span className="masked-secret-highlight">{finding.maskedSecret}</span>";
                      </span>
                    )}
                  </span>
                </div>
                <div className="code-line">
                  <span className="code-line-number">{(finding.line || 1) + 1}</span>
                  <span className="code-line-text text-slate-500">// Next line of execution</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">Confidence</span>
              <span className="text-sm font-bold font-mono text-cyan-300">
                {Math.round((finding.confidence || 0.85) * 100)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">Shannon Entropy</span>
              <span className="text-sm font-bold font-mono text-white">
                {(finding.entropy || 3.86).toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">Status</span>
              <span className={`badge-status ${finding.status?.toLowerCase()}`}>
                {finding.status}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">Commit Hash</span>
              <span className="text-xs font-bold font-mono text-slate-300 truncate block">
                {finding.metadata?.commitHash ? finding.metadata.commitHash.slice(0, 7) : "HEAD"}
              </span>
            </div>
          </div>

          {/* Remediation Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Recommended Remediation Checklist
            </h4>
            <div className="space-y-2">
              {(finding.remediation || [
                "Deactivate and revoke the leaked credential in provider dashboard immediately.",
                "Rotate the secret across all production and development environments.",
                "Remove sensitive files from Git commit history using git-filter-repo."
              ]).map((step, idx) => (
                <label 
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    checklist[idx]
                      ? "bg-emerald-500/10 border-emerald-500/30 text-slate-200"
                      : "bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[idx])}
                    onChange={() => handleToggleCheck(idx)}
                    className="mt-0.5 accent-cyan-500 cursor-pointer"
                  />
                  <span className={checklist[idx] ? "line-through opacity-70" : ""}>
                    {step}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Resolution Note */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Triage Audit Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Rotated key in AWS IAM and updated production secrets manager"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="input-cyber w-full py-2 text-xs rounded-xl"
            />
          </div>

        </div>

        {/* Modal Footer / Triage Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-t border-white/10 bg-slate-900/60">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusChange("FALSE_POSITIVE")}
              className="btn btn-secondary text-xs px-3.5 py-2 text-slate-300"
            >
              Mark False Positive
            </button>

            {finding.status === "OPEN" ? (
              <button
                onClick={() => handleStatusChange("RESOLVED")}
                className="btn btn-success text-xs px-4 py-2"
              >
                Mark as Resolved ✓
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("OPEN")}
                className="btn btn-danger text-xs px-4 py-2"
              >
                Reopen Finding
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
