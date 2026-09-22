import React from "react";

/**
 * SecretGuard Top Navigation Bar
 * Matching mockup: Brand shield, tabs with cyan indicator, repo dropdown, API LIVE pill, Run Scan CTA
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
    <header className="w-full mb-6">
      <nav className="glass-panel flex items-center justify-between gap-4 px-6 py-3.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-[#0F1626]/90">
        
        {/* Left: Brand Identity & Nav Tabs */}
        <div className="flex items-center gap-8">
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.45)] group-hover:shadow-[0_0_24px_rgba(6,182,212,0.7)] transition-all duration-300"
              style={{ width: "40px", height: "40px", minWidth: "40px", minHeight: "40px" }}
            >
              <svg 
                width="22" 
                height="22"
                style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px" }}
                className="text-white transform group-hover:scale-110 transition-transform duration-300" 
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
              <span className="text-xl font-black tracking-tight text-white">
                Secret<span className="text-cyan-400">Guard</span>
              </span>
            </div>
          </div>

          {/* Navigation Links with Mockup Styling */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`text-sm font-semibold tracking-wide transition-all cursor-pointer relative py-2 ${
                activeTab === "overview"
                  ? "text-cyan-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400 after:shadow-[0_0_8px_#06B6D4]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("findings")}
              className={`text-sm font-semibold tracking-wide transition-all cursor-pointer relative py-2 ${
                activeTab === "findings"
                  ? "text-cyan-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400 after:shadow-[0_0_8px_#06B6D4]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Findings Explorer
            </button>
            <button
              onClick={() => setActiveTab("repositories")}
              className={`text-sm font-semibold tracking-wide transition-all cursor-pointer relative py-2 ${
                activeTab === "repositories"
                  ? "text-cyan-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400 after:shadow-[0_0_8px_#06B6D4]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Repositories
            </button>
          </div>
        </div>

        {/* Right: Repository Selector, Health Status & Run Scan */}
        <div className="flex items-center gap-3.5">
          {/* Active Repository Selector */}
          <div className="relative hidden sm:block">
            <select
              value={selectedRepoId}
              onChange={(e) => onSelectRepo(e.target.value)}
              className="appearance-none bg-[#090D16] border border-white/10 rounded-xl px-4 py-2 pr-9 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 transition-all cursor-pointer shadow-inner hover:border-white/20"
            >
              <option value="all">Active Repository</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name} {repo.openFindingsCount > 0 ? `(${repo.openFindingsCount} leaks)` : "✓"}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider border select-none ${
              isLive
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            }`}
            title={isLive ? "Connected to live API" : "Running in fallback demo mode"}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? "bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse"
                  : "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
              }`}
              style={{ width: "8px", height: "8px", minWidth: "8px", minHeight: "8px" }}
            />
            {isLive ? "API LIVE" : "DEMO MODE"}
          </div>

          {/* Run Scan Action Button (Mockup Design) */}
          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:shadow-[0_0_28px_rgba(6,182,212,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border-none"
          >
            <svg
              width="14"
              height="14"
              style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px" }}
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Run Scan</span>
          </button>
        </div>

      </nav>
    </header>
  );
}