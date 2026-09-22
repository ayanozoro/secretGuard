import React, { useState } from "react";

/**
 * Interactive Findings Explorer Table
 * Matches mockup: Checkboxes, Severity pills with glowing outlines, File Path, Masked Secrets, and Triage actions
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
  selectedFinding = null,
  onSelectFinding = () => {},
  onQuickTriage = () => {}
}) {
  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleSelectAll = () => {
    if (selectedIds.size === findings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(findings.map((f) => f.id)));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeverityStyle = (sev) => {
    switch (sev?.toUpperCase()) {
      case "CRITICAL":
        return "text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.25)]";
      case "HIGH":
        return "text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.25)]";
      case "MEDIUM":
        return "text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.2)]";
      case "LOW":
        return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
      default:
        return "text-slate-400 border-white/20 bg-white/5";
    }
  };

  return (
    <section className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0F1626]/85 backdrop-blur-xl shadow-2xl flex flex-col h-full">
      
      {/* Header: Title & Search Bar (Exact Mockup Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white tracking-tight">
            Interactive Findings
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {findings.length}
          </span>
        </div>

        {/* Mockup Search Bar */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#080C14] border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Severity Filter Chips */}
      <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/5 overflow-x-auto">
        {severities.map((sev) => (
          <button
            key={sev}
            onClick={() => onSelectSeverity(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all cursor-pointer select-none ${
              selectedSeverity === sev
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-black/20 text-slate-400 hover:text-slate-200 border border-white/5 hover:bg-white/5"
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Findings Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
              <th className="pb-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={findings.length > 0 && selectedIds.size === findings.length}
                  onChange={toggleSelectAll}
                  className="rounded border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                />
              </th>
              <th className="pb-2.5 px-3">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
                  <span>Severity</span>
                  <span className="text-[10px]">↕</span>
                </div>
              </th>
              <th className="pb-2.5 px-3">File Path</th>
              <th className="pb-2.5 px-3">Masked Secrets</th>
              <th className="pb-2.5 px-3 text-right">Triage</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-400 font-mono">
                  Loading security findings...
                </td>
              </tr>
            ) : findings.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-semibold text-slate-300">No secret leaks found</span>
                    <span className="text-xs text-slate-500">Repository clean for selected filters</span>
                  </div>
                </td>
              </tr>
            ) : (
              findings.map((finding) => {
                const isSelected = selectedFinding?.id === finding.id;
                const isChecked = selectedIds.has(finding.id);

                return (
                  <tr
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className={`transition-all duration-150 cursor-pointer group select-none ${
                      isSelected
                        ? "bg-cyan-500/10 border-l-2 border-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelectOne(finding.id, e)}
                        className="rounded border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Severity Pill */}
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono tracking-wider uppercase inline-block ${getSeverityStyle(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </td>

                    {/* File Path */}
                    <td className="py-3 px-3 font-mono text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-100 group-hover:text-cyan-300 transition-colors font-medium">
                          {finding.filePath}
                        </span>
                        <span className="text-slate-500 text-[11px]">:{finding.line}</span>
                      </div>
                    </td>

                    {/* Masked Secret */}
                    <td className="py-3 px-3">
                      <code className="font-mono px-2 py-0.5 rounded bg-black/40 text-red-300 border border-red-500/20 text-[11px] tracking-wider inline-block">
                        {finding.maskedSecret}
                      </code>
                    </td>

                    {/* Triage Action Button */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === finding.id ? null : finding.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#0A0E1A] border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>{finding.status === "RESOLVED" ? "Resolved" : "Triage"}</span>
                          <span className="text-[9px] text-slate-400">▾</span>
                        </button>

                        {/* Triage Dropdown Menu */}
                        {openDropdownId === finding.id && (
                          <div 
                            className="absolute right-0 mt-1 w-36 rounded-xl bg-[#090D16] border border-white/15 shadow-2xl py-1 z-30 animate-in fade-in duration-100"
                            onMouseLeave={() => setOpenDropdownId(null)}
                          >
                            <button
                              onClick={() => {
                                onQuickTriage(finding.id, "RESOLVED", "Quick triage resolve");
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 cursor-pointer font-semibold flex items-center gap-2"
                            >
                              <span>✓</span> Resolve
                            </button>
                            <button
                              onClick={() => {
                                onQuickTriage(finding.id, "FALSE_POSITIVE", "Marked false positive");
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                            >
                              <span>✕</span> False Positive
                            </button>
                            <button
                              onClick={() => {
                                onSelectFinding(finding);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-cyan-400 hover:bg-cyan-500/10 cursor-pointer flex items-center gap-2"
                            >
                              <span>🔍</span> View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
