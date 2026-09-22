import React from "react";

/**
 * SecretGuard Left Sidebar Dock
 * Icon navigation dock matching the cybersecurity dashboard mockup
 */
export default function Sidebar({
  activeTab = "overview",
  setActiveTab = () => {},
  onOpenScanModal = () => {}
}) {
  return (
    <aside 
      className="hidden md:flex flex-col items-center justify-between py-5 bg-[#0A0E1A] border-r border-white/10 z-30 select-none flex-shrink-0"
      style={{ width: "64px", minWidth: "64px" }}
    >
      {/* Top Group: Primary Navigation */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* 1. Dashboard / Home */}
        <button
          onClick={() => setActiveTab("overview")}
          title="Dashboard Overview"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeTab === "overview"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.4)]"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
          style={{ width: "44px", height: "44px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        {/* 2. Findings Explorer */}
        <button
          onClick={() => setActiveTab("findings")}
          title="Findings Explorer"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeTab === "findings"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.4)]"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
          style={{ width: "44px", height: "44px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>

        {/* 3. Repositories */}
        <button
          onClick={() => setActiveTab("repositories")}
          title="Monitored Repositories"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeTab === "repositories"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.4)]"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
          style={{ width: "44px", height: "44px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        </button>

        {/* 4. Security Scan CTA */}
        <button
          onClick={onOpenScanModal}
          title="Trigger Security Scan"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 cursor-pointer"
          style={{ width: "44px", height: "44px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </button>

        {/* 5. Settings */}
        <button
          onClick={() => setActiveTab("overview")}
          title="Settings"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          style={{ width: "44px", height: "44px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Bottom Group: Help & Exit */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Help */}
        <button
          title="Documentation & Security Help"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
          style={{ width: "40px", height: "40px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* Exit */}
        <button
          title="Sign Out / Exit"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
          style={{ width: "40px", height: "40px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
