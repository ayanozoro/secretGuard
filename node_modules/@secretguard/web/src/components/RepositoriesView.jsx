import React from "react";

/**
 * Repositories Management & Posture View
 * Displays monitored code repositories, security health scores, and on-demand scan triggers.
 */
export default function RepositoriesView({
  repositories = [],
  onTriggerScan = () => {},
  onSelectRepoFindings = () => {}
}) {
  return (
    <section className="space-y-6">
      
      {/* View Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Monitored Code Repositories
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active repositories scanned for leaked secrets, API keys, and private certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
            {repositories.length} Active Repositories
          </span>
        </div>
      </div>

      {/* Repositories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {repositories.map((repo) => {
          const hasLeaks = (repo.openFindingsCount || 0) > 0;
          const isCritical = (repo.criticalFindingsCount || 0) > 0;

          return (
            <div 
              key={repo.id}
              className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                isCritical
                  ? "border-red-500/40 bg-gradient-to-br from-red-950/20 to-[#111827] shadow-[0_0_20px_rgba(239,68,68,0.12)]"
                  : hasLeaks
                  ? "border-amber-500/30 bg-[#111827]/80 hover:border-amber-500/50"
                  : "border-white/10 bg-[#111827]/70 hover:border-emerald-500/40"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {repo.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {repo.defaultBranch || "main"}
                    </span>
                    {repo.isPrivate && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 truncate max-w-sm">
                    {repo.url}
                  </p>
                </div>

                {/* Health Status Pill */}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  isCritical
                    ? "bg-red-500/15 text-red-300 border-red-500/40"
                    : hasLeaks
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                }`}>
                  {isCritical ? "CRITICAL RISK" : hasLeaks ? "VULNERABLE" : "HEALTHY"}
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-black/25 border border-white/5 mb-5 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Open Leaks</span>
                  <span className={`text-base font-bold font-mono ${hasLeaks ? "text-red-400" : "text-emerald-400"}`}>
                    {repo.openFindingsCount || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Critical</span>
                  <span className={`text-base font-bold font-mono ${repo.criticalFindingsCount > 0 ? "text-red-400" : "text-slate-300"}`}>
                    {repo.criticalFindingsCount || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Total Scans</span>
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {repo.totalScans || 0}
                  </span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  Scanned: {repo.lastScanAt ? new Date(repo.lastScanAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectRepoFindings(repo.id)}
                    className="btn btn-secondary text-xs px-3 py-1.5"
                  >
                    View Leaks
                  </button>
                  <button
                    onClick={() => onTriggerScan(repo.id)}
                    className="btn btn-primary text-xs px-3 py-1.5"
                  >
                    Scan Now
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
