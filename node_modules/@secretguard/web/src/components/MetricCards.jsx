import React from "react";

/**
 * Executive Telemetry Cards Component
 * Faithfully matches the cybersecurity dashboard mockup:
 * 1. Total Active Leaks (8)
 * 2. Critical Vulnerabilities (3) with prominent crimson glow
 * 3. Monitored Repositories (4)
 * 4. Scans Executed (28) (MTTR: ~2.4h)
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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      
      {/* 1. Total Active Leaks Card */}
      <div 
        onClick={onFilterOpen}
        className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0F1626]/85 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            Total Active Leaks
          </span>
          <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          </div>
        </div>

        <div>
          <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
            {summary.openFindings}
          </span>
        </div>
      </div>

      {/* 2. Critical Vulnerabilities Card (Crimson Alert Glow from Mockup) */}
      <div 
        onClick={onFilterCritical}
        className="relative overflow-hidden p-5 rounded-2xl border-2 border-red-500/80 bg-gradient-to-br from-red-950/40 via-[#0F1626]/90 to-[#0F1626] shadow-[0_0_24px_rgba(239,68,68,0.45)] hover:shadow-[0_0_32px_rgba(239,68,68,0.65)] hover:border-red-400 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        style={{
          boxShadow: "0 0 24px rgba(239, 68, 68, 0.4), inset 0 0 15px rgba(239, 68, 68, 0.12)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-red-400 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" style={{ width: "8px", height: "8px" }} />
            Critical Vulnerabilities
          </span>
          <div className="text-red-400 group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        <div>
          <span className="text-4xl font-extrabold text-red-100 tracking-tight font-mono">
            {summary.criticalOpen}
          </span>
        </div>
      </div>

      {/* 3. Monitored Repositories Card */}
      <div 
        className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0F1626]/85 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            Monitored Repositories
          </span>
          <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
        </div>

        <div>
          <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
            {summary.totalRepositories}
          </span>
        </div>
      </div>

      {/* 4. Scans Executed Card */}
      <div 
        className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0F1626]/85 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            Scans Executed
          </span>
          <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
            {summary.totalScans}
          </span>
          <span className="text-xs font-mono text-slate-400">
            (MTTR: ~2.4h)
          </span>
        </div>
      </div>

    </section>
  );
}
