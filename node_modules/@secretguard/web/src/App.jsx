import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar.jsx";
import MetricCards from "./components/MetricCards.jsx";
import FindingsTable from "./components/FindingsTable.jsx";
import FindingDetailModal from "./components/FindingDetailModal.jsx";
import RepositoriesView from "./components/RepositoriesView.jsx";
import ScanModal from "./components/ScanModal.jsx";
import api from "./services/api.js";

export default function App() {
  // Live / Demo Connection Status
  const [isLive, setIsLive] = useState(false);

  // Core Data States
  const [stats, setStats] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [findings, setFindings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRepoId, setSelectedRepoId] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Initial Load: Check Backend Health, Overview Stats, Repositories
  const loadInitialData = useCallback(async () => {
    try {
      const health = await api.checkBackendHealth();
      setIsLive(health);

      const [statsRes, reposRes] = await Promise.all([
        api.getOverviewStats(),
        api.getRepositories()
      ]);

      setStats(statsRes.data);
      setRepositories(reposRes.data?.repositories || []);
    } catch (err) {
      console.error("Failed to load initial dashboard data:", err);
    }
  }, []);

  // 2. Fetch Findings whenever filters change
  const loadFindings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getFindings({
        repositoryId: selectedRepoId === "all" ? undefined : selectedRepoId,
        severity: selectedSeverity,
        status: selectedStatus,
        search: searchQuery
      });
      setFindings(res.data?.findings || []);
    } catch (err) {
      console.error("Failed to load findings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepoId, selectedSeverity, selectedStatus, searchQuery]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadFindings();
  }, [loadFindings]);

  // Handle Finding Triage
  const handleUpdateFindingStatus = async (id, status, resolutionNote) => {
    try {
      await api.updateFindingStatus(id, { status, resolutionNote });
      showToast(`Finding marked as ${status}`);
      // Refresh findings and overview statistics
      loadFindings();
      const statsRes = await api.getOverviewStats();
      setStats(statsRes.data);
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Handle Scan Execution
  const handleExecuteScan = async (params) => {
    try {
      const res = await api.triggerScan(params);
      showToast(res.data?.message || "Scan completed successfully!");
      // Reload stats, repos, and findings
      const [statsRes, reposRes] = await Promise.all([
        api.getOverviewStats(),
        api.getRepositories()
      ]);
      setStats(statsRes.data);
      setRepositories(reposRes.data?.repositories || []);
      loadFindings();
    } catch (err) {
      showToast(err.message || "Scan execution failed", "error");
    }
  };

  // Filter shortcuts from Metric Cards
  const handleFilterCritical = () => {
    setSelectedSeverity("CRITICAL");
    setSelectedStatus("OPEN");
    setActiveTab("findings");
  };

  const handleFilterOpen = () => {
    setSelectedSeverity("ALL");
    setSelectedStatus("OPEN");
    setActiveTab("findings");
  };

  const handleSelectRepoFindings = (repoId) => {
    setSelectedRepoId(repoId);
    setActiveTab("findings");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 duration-300 bg-slate-900/90 border-cyan-500/40 text-slate-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex-1">
        
        {/* Top Navbar */}
        <Navbar
          isLive={isLive}
          repositories={repositories}
          selectedRepoId={selectedRepoId}
          onSelectRepo={setSelectedRepoId}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic View Switching */}
        {activeTab === "overview" && (
          <main className="animate-in fade-in duration-300">
            {/* Telemetry Metric Cards */}
            <MetricCards
              stats={stats}
              onFilterCritical={handleFilterCritical}
              onFilterOpen={handleFilterOpen}
            />

            {/* Overview Sub-Grid: Top Rules & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Top Vulnerability Categories */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#111827]/70">
                <h3 className="text-sm font-bold text-white tracking-tight mb-3 flex items-center justify-between">
                  <span>Top Leaked Secret Types</span>
                  <span className="text-[11px] font-mono text-slate-400">By Frequency</span>
                </h3>
                <div className="space-y-3">
                  {(stats?.topVulnerabilities || [
                    { name: "AWS Access Key ID", count: 4, severity: "CRITICAL" },
                    { name: "GitHub Personal Access Token", count: 3, severity: "HIGH" },
                    { name: "Database Connection URI", count: 3, severity: "CRITICAL" },
                    { name: "RSA Private Key Header", count: 2, severity: "CRITICAL" }
                  ]).map((vuln, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${vuln.severity === 'CRITICAL' ? 'bg-red-400' : 'bg-amber-400'}`} />
                        <span className="text-xs font-semibold text-slate-200">{vuln.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">
                        {vuln.count} detected
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Scan Activity */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#111827]/70 lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Recent Scan Audits
                  </h3>
                  <button 
                    onClick={() => setIsScanModalOpen(true)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    + Trigger New Scan
                  </button>
                </div>
                <div className="space-y-2.5">
                  {(stats?.recentScans || []).map((scan) => (
                    <div key={scan.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-slate-200">{scan.repositoryId?.name || "Repository"}</span>
                        <span className="font-mono text-[11px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {scan.branch || "main"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                        <span>{scan.totalFindings} findings</span>
                        <span>{scan.durationMs}ms</span>
                        <span>{new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Findings Explorer Section */}
            <FindingsTable
              findings={findings}
              isLoading={isLoading}
              selectedSeverity={selectedSeverity}
              onSelectSeverity={setSelectedSeverity}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onInspectFinding={setSelectedFinding}
              onQuickTriage={handleUpdateFindingStatus}
            />
          </main>
        )}

        {activeTab === "findings" && (
          <main className="animate-in fade-in duration-300">
            <FindingsTable
              findings={findings}
              isLoading={isLoading}
              selectedSeverity={selectedSeverity}
              onSelectSeverity={setSelectedSeverity}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onInspectFinding={setSelectedFinding}
              onQuickTriage={handleUpdateFindingStatus}
            />
          </main>
        )}

        {activeTab === "repositories" && (
          <main className="animate-in fade-in duration-300">
            <RepositoriesView
              repositories={repositories}
              onTriggerScan={() => setIsScanModalOpen(true)}
              onSelectRepoFindings={handleSelectRepoFindings}
            />
          </main>
        )}

      </div>

      {/* Finding Detail Inspection Modal */}
      <FindingDetailModal
        finding={selectedFinding}
        isOpen={Boolean(selectedFinding)}
        onClose={() => setSelectedFinding(null)}
        onUpdateStatus={handleUpdateFindingStatus}
      />

      {/* Trigger Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        repositories={repositories}
        onExecuteScan={handleExecuteScan}
      />

      {/* Platform Footer */}
      <footer className="w-full border-t border-white/5 py-5 mt-12 bg-black/40 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SecretGuard Intelligence & Prevention Platform v1.0</span>
          <span className="text-cyan-500/80">Zero-Plaintext Policy Compliant</span>
        </div>
      </footer>

    </div>
  );
}
