import React from "react";

/**
 * SecretGuard Top Navigation Bar
 * Built with Tailwind CSS v4 & Glassmorphism Design System
 */
export default function Navbar({
  isLive = true,
  repositories = [],
  selectedRepoId = "all",
  onSelectRepo = () => {},
  onOpenScanModal = () => {},
  activeTab = "overview",
  setActiveTab = () => {}
}) {
  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <nav className="glass-panel flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-[#111827]/80">
        
        {/* Left: Brand Identity & Nav Links */}
        <div className="flex items-center gap-8">
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.45)] group-hover:shadow-[0_0_24px_rgba(6,182,212,0.7)] transition-all duration-300">
              <svg 
                className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-100">
                  Secret<span className="text-cyan-400">Guard</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 tracking-wide">
                Leak Intelligence & Prevention
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/5">
            <li>
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-white/10 text-cyan-300 border border-white/15 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("findings")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === "findings"
                    ? "bg-white/10 text-cyan-300 border border-white/15 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Findings Explorer
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("repositories")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === "repositories"
                    ? "bg-white/10 text-cyan-300 border border-white/15 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                Repositories
              </button>
            </li>
          </ul>
        </div>

        {/* Right: Controls, Health Status & CTA */}
        <div className="flex items-center gap-3.5">
          {/* Repository Selector Dropdown */}
          <div className="hidden sm:block">
            <select
              value={selectedRepoId}
              onChange={(e) => onSelectRepo(e.target.value)}
              className="bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">All Repositories</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name} {repo.openFindingsCount > 0 ? `(${repo.openFindingsCount} leaks)` : "✓"}
                </option>
              ))}
            </select>
          </div>

          {/* Connection Status Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider border select-none ${
              isLive
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
            title={isLive ? "Connected to live API" : "Running in fallback demo mode"}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isLive
                  ? "bg-emerald-400 shadow-[0_0_8px_#10B981]"
                  : "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
              }`}
            />
            {isLive ? "API LIVE" : "DEMO MODE"}
          </div>

          {/* Run Scan Action CTA */}
          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 stroke-[2.5]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
            <span>Run Scan</span>
          </button>
        </div>

      </nav>
    </header>
  );
}