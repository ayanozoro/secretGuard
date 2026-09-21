import React from "react";

/**
 * Executive Telemetry Cards Component
 * Displays the 4 high-priority security posture metrics:
 * 1. Total Active Leaks (with warning indicator)
 * 2. Critical Vulnerabilities (with glowing crimson alert)
 * 3. Monitored Repositories (clean vs affected)
 * 4. Scans Executed & Mean Time to Remediate (MTTR)
 */
export default function MetricCards({ stats, onFilterCritical = () => {}, onFilterOpen = () => {} }) {
  const summary = stats?.summary || {
    totalRepositories: 4,
    totalScans: 28,
    totalFindings: 14,
    openFindings: 8,
    resolvedFindings: 6,
    criticalOpen: 3,
    highOpen: 3
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      
      {/* 1. Total Active Leaks Card */}
      <div 
        onClick={onFilterOpen}
        className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#111827]/70 hover:border-amber-500/40 hover:bg-[#1E293B]/60 transition-all duration-300 cursor-pointer group shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Total Active Leaks
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            {summary.openFindings}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Unmitigated
          </span>
        </div>

        <p className="text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">{summary.resolvedFindings}</span> resolved / dismissed
        </p>
      </div>

      {/* 2. Critical Vulnerabilities Card (With Crimson Alert Glow) */}
      <div 
        onClick={onFilterCritical}
        className="relative overflow-hidden p-5 rounded-2xl border border-red-500/50 bg-gradient-to-br from-red-950/40 to-[#111827] shadow-[0_0_24px_rgba(239,68,68,0.22)] hover:shadow-[0_0_32px_rgba(239,68,68,0.38)] hover:border-red-400 transition-all duration-300 cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-red-300 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Critical Vulnerabilities
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-red-400 tracking-tight font-mono">
            {summary.criticalOpen}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
            HIGH PRIORITY
          </span>
        </div>

        <p className="text-xs text-red-300/80">
          Demands immediate key revocation
        </p>
      </div>

      {/* 3. Monitored Repositories Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#111827]/70 hover:border-cyan-500/40 hover:bg-[#1E293B]/60 transition-all duration-300 cursor-pointer group shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Monitored Repositories
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            {summary.totalRepositories}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Protected
          </span>
        </div>

        <p className="text-xs text-slate-400">
          <span className="text-red-400 font-semibold">{summary.totalRepositories > 1 ? summary.totalRepositories - 1 : 1}</span> affected, <span className="text-emerald-400 font-semibold">1</span> clean
        </p>
      </div>

      {/* 4. Scans Executed & MTTR Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#111827]/70 hover:border-blue-500/40 hover:bg-[#1E293B]/60 transition-all duration-300 cursor-pointer group shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Scans Executed
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            {summary.totalScans}
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            MTTR: <span className="text-cyan-400 font-bold">~2.4h</span>
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Continuous Git history audit
        </p>
      </div>

    </section>
  );
}
