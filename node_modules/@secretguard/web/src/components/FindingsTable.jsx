import React from "react";

/**
 * Interactive Findings Explorer Table
 * Displays detected secret leaks with severity filters, search, and triage actions.
 */
export default function FindingsTable({
  findings = [],
  isLoading = false,
  selectedSeverity = "ALL",
  onSelectSeverity = () => {},
  selectedStatus = "ALL",
  onSelectStatus = () => {},
  searchQuery = "",
  onSearchChange = () => {},
  onInspectFinding = () => {},
  onQuickTriage = () => {}
}) {
  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const statuses = [
    { label: "All Statuses", value: "ALL" },
    { label: "Open Leaks", value: "OPEN" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "False Positives", value: "FALSE_POSITIVE" }
  ];

  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toUpperCase()) {
      case "CRITICAL":
        return "badge-severity critical";
      case "HIGH":
        return "badge-severity high";
      case "MEDIUM":
        return "badge-severity medium";
      case "LOW":
        return "badge-severity low";
      default:
        return "badge-severity info";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "badge-status open";
      case "RESOLVED":
        return "badge-status resolved";
      case "FALSE_POSITIVE":
        return "badge-status false_positive";
      default:
        return "badge-status";
    }
  };

  return (
    <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-[#111827]/75 backdrop-blur-xl shadow-xl">
      
      {/* Table Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Secret Leak Findings</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300">
              {findings.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-Plaintext Policy: All secret tokens are irreversibly masked.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-72 relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by rule, path, or type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-cyber w-full pl-9 pr-8 py-2 text-xs rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips: Severity & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/5">
        {/* Severity Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Severity:</span>
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => onSelectSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "bg-black/30 text-slate-400 hover:text-slate-200 border border-white/5"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Dropdown/Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {statuses.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs font-mono uppercase tracking-wider">
              <th className="pb-3 px-3">Severity</th>
              <th className="pb-3 px-3">Rule Name & Type</th>
              <th className="pb-3 px-3">File Location</th>
              <th className="pb-3 px-3">Masked Secret</th>
              <th className="pb-3 px-3">Confidence</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-400 font-mono">
                  Loading security findings...
                </td>
              </tr>
            ) : findings.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="font-semibold text-slate-300">No secret leaks detected</span>
                    <span className="text-xs text-slate-500">All scanned files match security policy</span>
                  </div>
                </td>
              </tr>
            ) : (
              findings.map((finding) => (
                <tr 
                  key={finding.id}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={() => onInspectFinding(finding)}
                >
                  {/* Severity */}
                  <td className="py-3.5 px-3">
                    <span className={getSeverityBadgeClass(finding.severity)}>
                      {finding.severity}
                    </span>
                  </td>

                  {/* Rule Name */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {finding.ruleName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {finding.type}
                    </div>
                  </td>

                  {/* File Location */}
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    <span className="text-cyan-400">{finding.filePath}</span>
                    <span className="text-slate-500">:{finding.line}</span>
                  </td>

                  {/* Masked Secret */}
                  <td className="py-3.5 px-3">
                    <code className="font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 text-[11px] tracking-wider">
                      {finding.maskedSecret}
                    </code>
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{Math.round((finding.confidence || 0.85) * 100)}%</span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.round((finding.confidence || 0.85) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span className={getStatusBadgeClass(finding.status)}>
                      {finding.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onInspectFinding(finding)}
                        className="btn btn-secondary text-xs px-2.5 py-1"
                      >
                        Inspect
                      </button>

                      {finding.status === "OPEN" ? (
                        <button
                          onClick={() => onQuickTriage(finding.id, "RESOLVED")}
                          className="btn btn-success text-xs px-2.5 py-1"
                          title="Mark finding as resolved"
                        >
                          Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => onQuickTriage(finding.id, "OPEN")}
                          className="btn btn-secondary text-xs px-2.5 py-1"
                          title="Reopen finding"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
