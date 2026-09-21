import React, { useState } from "react";

/**
 * Trigger Scan Modal
 * Allows initiating an on-demand secret scan on a repository or local directory.
 */
export default function ScanModal({
  isOpen = false,
  onClose = () => {},
  repositories = [],
  onExecuteScan = () => {}
}) {
  const [selectedRepoId, setSelectedRepoId] = useState(repositories[0]?.id || "");
  const [targetPath, setTargetPath] = useState("./test-project");
  const [includeHistory, setIncludeHistory] = useState(false);
  const [maxCommits, setMaxCommits] = useState(50);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    try {
      await onExecuteScan({
        repositoryId: selectedRepoId || repositories[0]?.id,
        targetPath,
        includeHistory,
        maxCommits
      });
      onClose();
    } catch (err) {
      console.error("Scan trigger error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/15 bg-[#111827] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Trigger Secret Scan
              </h3>
              <p className="text-xs text-slate-400">
                Run scanner with regex detectors, Shannon entropy, and context analysis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Repository */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Target Repository
            </label>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="input-cyber w-full py-2 rounded-xl text-xs"
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name} ({repo.defaultBranch || "main"})
                </option>
              ))}
            </select>
          </div>

          {/* Directory Path */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Local Directory Path
            </label>
            <input
              type="text"
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="./src or ./test-project"
              className="input-cyber w-full py-2 rounded-xl text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Path relative to project workspace or absolute path.
            </p>
          </div>

          {/* Git History Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-3">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Scan Git Commit History (--history)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Inspect commit diffs to discover deleted or past leaked secrets
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeHistory}
                onChange={(e) => setIncludeHistory(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </label>

            {includeHistory && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                <span className="text-slate-400">Max Commit Depth:</span>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={maxCommits}
                    onChange={(e) => setMaxCommits(Number(e.target.value))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-cyan-300 font-bold">{maxCommits}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs px-4 py-2"
              disabled={isScanning}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs px-5 py-2 flex items-center gap-2"
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <span>Launch Scan</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
