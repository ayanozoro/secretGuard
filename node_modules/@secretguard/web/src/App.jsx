import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import MetricCards from "./components/MetricCards.jsx";
import FindingsTable from "./components/FindingsTable.jsx";
import CodeDetailsPanel from "./components/CodeDetailsPanel.jsx";
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

  // Interactive Selection State (Default to first finding for the Code Details split-view)
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
      const items = res.data?.findings || [];
      setFindings(items);
      
      // Keep selected finding or default to the first one for the Code Details panel
      setSelectedFinding((prev) => {
        if (prev && items.some(f => f.id === prev.id)) {
          return items.find(f => f.id === prev.id);
        }
        return items[0] || null;
      });
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
    setActiveTab("overview");
  };

  const handleFilterOpen = () => {
    setSelectedSeverity("ALL");
    setSelectedStatus("OPEN");
    setActiveTab("overview");
  };

  const handleSelectRepoFindings = (repoId) => {
    setSelectedRepoId(repoId);
    setActiveTab("overview");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070A12] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Left Vertical Sidebar Dock */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanModal={() => setIsScanModalOpen(true)}
      />

      {/* 2. Main Scrollable Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 duration-300 bg-slate-900/90 border-cyan-500/40 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        <div className="w-full px-6 py-5 flex-1 flex flex-col">
          
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

          {/* Dynamic View Content */}
          {activeTab === "overview" && (
            <main className="flex-1 flex flex-col space-y-6">
              
              {/* Executive Telemetry Metric Cards */}
              <MetricCards
                stats={stats}
                onFilterCritical={handleFilterCritical}
                onFilterOpen={handleFilterOpen}
              />

              {/* Split-Screen Dashboard: Interactive Findings (Left) + Code Details (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
                
                {/* Left Column: Interactive Findings Table */}
                <div className="lg:col-span-7 xl:col-span-8 h-full">
                  <FindingsTable
                    findings={findings}
                    isLoading={isLoading}
                    selectedSeverity={selectedSeverity}
                    onSelectSeverity={setSelectedSeverity}
                    selectedStatus={selectedStatus}
                    onSelectStatus={setSelectedStatus}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedFinding={selectedFinding}
                    onSelectFinding={setSelectedFinding}
                    onQuickTriage={handleUpdateFindingStatus}
                  />
                </div>

                {/* Right Column: Code Details & Remediation Checklist Panel */}
                <div className="lg:col-span-5 xl:col-span-4 h-full">
                  <CodeDetailsPanel
                    finding={selectedFinding}
                    onClose={() => setSelectedFinding(null)}
                    onUpdateStatus={handleUpdateFindingStatus}
                  />
                </div>

              </div>

            </main>
          )}

          {activeTab === "findings" && (
            <main className="flex-1 space-y-6">
              <FindingsTable
                findings={findings}
                isLoading={isLoading}
                selectedSeverity={selectedSeverity}
                onSelectSeverity={setSelectedSeverity}
                selectedStatus={selectedStatus}
                onSelectStatus={setSelectedStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedFinding={selectedFinding}
                onSelectFinding={(f) => {
                  setSelectedFinding(f);
                  setIsDetailModalOpen(true);
                }}
                onQuickTriage={handleUpdateFindingStatus}
              />
            </main>
          )}

          {activeTab === "repositories" && (
            <main className="flex-1 space-y-6">
              <RepositoriesView
                repositories={repositories}
                onTriggerScan={() => setIsScanModalOpen(true)}
                onSelectRepoFindings={handleSelectRepoFindings}
              />
            </main>
          )}

          {/* Platform Footer */}
          <footer className="w-full border-t border-white/5 py-4 mt-8 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>SecretGuard Intelligence & Prevention Platform v1.0</span>
            <span className="text-cyan-500/80">Zero-Plaintext Policy Compliant</span>
          </footer>

        </div>

      </div>

      {/* Finding Detail Inspection Modal (Available when deep inspecting or on mobile) */}
      <FindingDetailModal
        finding={selectedFinding}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={handleUpdateFindingStatus}
      />

      {/* Trigger Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        repositories={repositories}
        onExecuteScan={handleExecuteScan}
      />

    </div>
  );
}
