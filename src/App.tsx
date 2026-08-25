import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchAllStartupsFromSupabase, 
  updateStartupInSupabase, 
  bulkDeleteStartupsFromSupabase,
  fetchUserWorkspace,
  saveUserWorkspace,
  autoVerifyStartup,
  supabase 
} from './lib/supabase';
import { 
  Startup, 
  TargetView, 
  PipelineAssumptions, 
  ApiKeysConfig, 
  UserWorkspaceDelta 
} from './lib/types';
import { 
  getSavedPipelineAssumptions, 
  getSavedApiKeys, 
  getSavedGuestDelta, 
  saveGuestDelta,
  applyWorkspaceDeltas,
  calculateGtmMetrics,
  DEFAULT_PIPELINE_ASSUMPTIONS 
} from './lib/workspace-store';
import { parseCurrentUrl, syncUrl, RouteState } from './lib/router';
import { useTheme } from './lib/theme';
import { Header } from './components/Header';
import { GtmMetricCards } from './components/GtmMetricCards';
import { LandscapeTable } from './components/LandscapeTable';
import { AccountDrawer } from './components/AccountDrawer';
import { CohortAnalytics } from './components/CohortAnalytics';
import { ApiKeysModal } from './components/ApiKeysModal';
import { PipelineMathModal } from './components/PipelineMathModal';
import { BulkActionsBar } from './components/BulkActionsBar';
import { AuthModal } from './components/AuthModal';
import { GuestSoftPrompt } from './components/GuestSoftPrompt';
import { EditCompanyModal } from './components/EditCompanyModal';
import { RefreshCw, LayoutGrid, BarChart2 } from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  
  // Initial URL Route State
  const initialRoute = useMemo(() => parseCurrentUrl(), []);

  // Master database state
  const [masterStartups, setMasterStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'landscape' | 'cohorts'>(initialRoute.activeTab);
  
  // Executive configuration state
  const [targetView, setTargetView] = useState<TargetView>(initialRoute.targetView);
  const [pipelineAssumptions, setPipelineAssumptions] = useState<PipelineAssumptions>(getSavedPipelineAssumptions);
  const [apiKeysConfig, setApiKeysConfig] = useState<ApiKeysConfig>(getSavedApiKeys);
  
  // Multi-Tenant Workspace State (Guest vs User vs Admin)
  const [user, setUser] = useState<any>(null);
  const [activeDelta, setActiveDelta] = useState<UserWorkspaceDelta>(getSavedGuestDelta);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [guestPromptAction, setGuestPromptAction] = useState('territory changes');
  
  // UI interaction state
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(initialRoute.statusFilter);
  const [unverifiedSubFilter, setUnverifiedSubFilter] = useState<'all' | 'surface_free' | 'deep_scraped' | 'unscanned'>(initialRoute.unverifiedSubFilter);
  const [isBulkAutoVerifying, setIsBulkAutoVerifying] = useState(false);
  
  // Modals
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [isPipelineMathOpen, setIsPipelineMathOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Admin Identification: Generic RBAC & Admin role
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    return email.includes('admin') || user.role === 'admin' || user.user_metadata?.role === 'admin';
  }, [user]);

  // 1. Bidirectional URL Synchronization
  useEffect(() => {
    syncUrl({
      targetView,
      activeTab,
      statusFilter,
      unverifiedSubFilter,
      accountId: selectedStartup ? (selectedStartup.id || selectedStartup.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) : null
    });
  }, [targetView, activeTab, statusFilter, unverifiedSubFilter, selectedStartup]);

  // 2. Browser Back / Forward History Popstate Listener
  useEffect(() => {
    const handlePopState = () => {
      const route = parseCurrentUrl();
      setTargetView(route.targetView);
      setActiveTab(route.activeTab);
      setStatusFilter(route.statusFilter);
      setUnverifiedSubFilter(route.unverifiedSubFilter);
      
      if (route.accountId && masterStartups.length > 0) {
        const match = masterStartups.find(s => 
          s.id === route.accountId || 
          s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === route.accountId?.toLowerCase()
        );
        setSelectedStartup(match || null);
      } else if (!route.accountId) {
        setSelectedStartup(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [masterStartups]);

  // 3. Supabase Auth listener & User Workspace Sync
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const cloudDelta = await fetchUserWorkspace(u.id);
        if (cloudDelta) {
          setActiveDelta(cloudDelta);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const cloudDelta = await fetchUserWorkspace(u.id);
        if (cloudDelta) {
          setActiveDelta(cloudDelta);
        }
      } else {
        setActiveDelta(getSavedGuestDelta());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 4. Fetch master dataset from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchAllStartupsFromSupabase();
      if (!error && data) {
        setMasterStartups(data);
        
        // Check deep-link account if present in initial URL
        if (initialRoute.accountId) {
          const match = data.find(s => 
            s.id === initialRoute.accountId || 
            s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === initialRoute.accountId?.toLowerCase()
          );
          if (match) setSelectedStartup(match);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 5. Persist configuration changes
  const handleTargetViewChange = (view: TargetView) => {
    setTargetView(view);
    localStorage.setItem('stackpulse_target_view', view);
  };

  const handleSavePipelineAssumptions = (assumptions: PipelineAssumptions) => {
    setPipelineAssumptions(assumptions);
    localStorage.setItem('stackpulse_pipeline_assumptions', JSON.stringify(assumptions));
  };

  const handleSaveApiKeys = (config: ApiKeysConfig) => {
    setApiKeysConfig(config);
    localStorage.setItem('stackpulse_api_keys', JSON.stringify(config));
  };

  const triggerGuestPrompt = (action: string) => {
    if (!user) {
      setGuestPromptAction(action);
      setGuestPromptOpen(true);
    }
  };

  const commitDeltaChange = async (nextDelta: UserWorkspaceDelta) => {
    setActiveDelta(nextDelta);
    if (user) {
      await saveUserWorkspace(user.id, nextDelta);
    } else {
      saveGuestDelta(nextDelta);
    }
  };

  // 6. Compute Active Workspace Startups (Master - Deltas)
  const activeStartups = useMemo(() => {
    return applyWorkspaceDeltas(masterStartups, activeDelta);
  }, [masterStartups, activeDelta]);

  // Compute GTM KPI metrics dynamically using Financial Ontology
  const metrics = useMemo(() => {
    return calculateGtmMetrics(activeStartups, targetView, pipelineAssumptions);
  }, [activeStartups, targetView, pipelineAssumptions]);

  // 7. Comprehensive 6D Company Detail Corrections Handler
  const handleSaveCompanyCorrections = async (id: string, updates: Partial<Startup>) => {
    triggerGuestPrompt('company intelligence corrections');

    if (isAdmin) {
      await updateStartupInSupabase(id, updates);
      setMasterStartups(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } else {
      const nextDelta: UserWorkspaceDelta = {
        ...activeDelta,
        stack_overrides: {
          ...activeDelta.stack_overrides,
          ...(updates.database_stack ? { [id]: updates.database_stack } : {})
        },
        verified_overrides: {
          ...activeDelta.verified_overrides,
          ...(updates.verification_status ? { [id]: updates.verification_status === 'verified' } : {})
        },
        arr_overrides: {
          ...activeDelta.arr_overrides,
          ...(typeof updates.custom_arr_override === 'number' ? { [id]: updates.custom_arr_override } : {})
        },
        ontology_overrides: {
          ...activeDelta.ontology_overrides,
          [id]: {
            primary_database: updates.primary_database,
            vector_engine: updates.vector_engine,
            cache_layer: updates.cache_layer,
            olap_engine: updates.olap_engine,
            auth_provider: updates.auth_provider,
            runtime_platform: updates.runtime_platform
          }
        }
      };
      await commitDeltaChange(nextDelta);
    }

    if (selectedStartup && selectedStartup.id === id) {
      setSelectedStartup({
        ...selectedStartup,
        ...updates
      });
    }
  };

  const handleUpdateStack = async (id: string, newStack: string) => {
    await handleSaveCompanyCorrections(id, {
      database_stack: newStack,
      verification_status: newStack !== 'Unknown' && newStack.length > 0 ? 'verified' : 'unverified',
      verification_depth: newStack !== 'Unknown' && newStack.length > 0 ? 'confirmed' : 'deep_scraped'
    });
  };

  const handleToggleVerify = async (id: string, isVerified: boolean) => {
    await handleSaveCompanyCorrections(id, {
      verification_status: isVerified ? 'verified' : 'unverified'
    });
  };

  const handleDeleteAccount = async (id: string) => {
    triggerGuestPrompt('account deletions');

    if (isAdmin) {
      await bulkDeleteStartupsFromSupabase([id]);
      setMasterStartups(prev => prev.filter(s => s.id !== id));
    } else {
      const nextDelta: UserWorkspaceDelta = {
        ...activeDelta,
        deleted_ids: [...new Set([...activeDelta.deleted_ids, id])]
      };
      await commitDeltaChange(nextDelta);
    }

    setSelectedStartup(null);
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleBulkDelete = async () => {
    triggerGuestPrompt('bulk territory deletions');

    if (isAdmin) {
      await bulkDeleteStartupsFromSupabase(selectedIds);
      setMasterStartups(prev => prev.filter(s => !selectedIds.includes(s.id)));
    } else {
      const nextDelta: UserWorkspaceDelta = {
        ...activeDelta,
        deleted_ids: [...new Set([...activeDelta.deleted_ids, ...selectedIds])]
      };
      await commitDeltaChange(nextDelta);
    }

    setSelectedIds([]);
  };

  const handleBulkVerify = async () => {
    triggerGuestPrompt('bulk verification');

    if (isAdmin) {
      await Promise.all(selectedIds.map(id => updateStartupInSupabase(id, { verification_status: 'verified' })));
      setMasterStartups(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, verification_status: 'verified' } : s));
    } else {
      const verifiedMap = { ...activeDelta.verified_overrides };
      selectedIds.forEach(id => {
        verifiedMap[id] = true;
      });
      const nextDelta: UserWorkspaceDelta = {
        ...activeDelta,
        verified_overrides: verifiedMap
      };
      await commitDeltaChange(nextDelta);
    }

    setSelectedIds([]);
  };

  const handleSingleAutoVerify = async (startup: Startup) => {
    const result = await autoVerifyStartup(startup, apiKeysConfig);
    await handleSaveCompanyCorrections(startup.id, {
      database_stack: result.database_stack,
      vector_search: result.vector_search,
      stack_source: result.source,
      verification_depth: result.depth,
      verification_status: result.database_stack !== 'Unknown' ? 'verified' : 'unverified'
    });
  };

  const handleBulkAutoVerify = async () => {
    setIsBulkAutoVerifying(true);
    try {
      const targets = activeStartups.filter(s => selectedIds.includes(s.id));
      for (const startup of targets) {
        await handleSingleAutoVerify(startup);
      }
      setSelectedIds([]);
    } finally {
      setIsBulkAutoVerifying(false);
    }
  };

  const handleExportCsv = () => {
    const targets = selectedIds.length > 0
      ? activeStartups.filter(s => selectedIds.includes(s.id))
      : activeStartups;

    const headers = ['Name', 'Website', 'Cohort', 'Industry', 'Database Stack', 'Vector Layer', 'Provenance Depth', 'Verification Status'];
    const rows = targets.map(s => [
      `"${s.name}"`,
      `"${s.url}"`,
      `"${s.yc_batch || s.batch || s.category}"`,
      `"${s.industry}"`,
      `"${s.database_stack}"`,
      `"${s.vector_search}"`,
      `"${s.verification_depth || 'surface_free'}"`,
      `"${s.verification_status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stackpulse_territory_${targetView}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetWorkspace = async () => {
    const emptyDelta: UserWorkspaceDelta = { deleted_ids: [], stack_overrides: {}, verified_overrides: {}, arr_overrides: {}, ontology_overrides: {} };
    await commitDeltaChange(emptyDelta);
    setSelectedIds([]);
  };

  const hasGuestDeltas = activeDelta.deleted_ids.length > 0 || 
    Object.keys(activeDelta.stack_overrides).length > 0 || 
    Object.keys(activeDelta.verified_overrides).length > 0 ||
    Object.keys(activeDelta.arr_overrides || {}).length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Executive Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        targetView={targetView}
        onChangeTargetView={handleTargetViewChange}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
        onOpenPipelineMath={() => setIsPipelineMathOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        user={user}
        isAdmin={isAdmin}
        onSignOut={() => supabase.auth.signOut()}
        totalTracked={metrics.tracked_startups}
        verifiedCount={metrics.verified_count}
        hasGuestDeltas={hasGuestDeltas}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs & Refresh */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('landscape')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'landscape'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Account Landscape</span>
            </button>
            <button
              onClick={() => setActiveTab('cohorts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'cohorts'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Portfolio Intelligence</span>
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs"
            title="Reload live dataset from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Sync Live Data</span>
          </button>
        </div>

        {/* Dynamic GTM KPI Metric Cards */}
        <GtmMetricCards
          metrics={metrics}
          targetView={targetView}
          onFilterByStatus={(status) => {
            setStatusFilter(status);
            setActiveTab('landscape');
          }}
        />

        {/* Tab Content */}
        {activeTab === 'landscape' ? (
          <LandscapeTable
            startups={activeStartups}
            targetView={targetView}
            financialAssumptions={pipelineAssumptions}
            onSelectStartup={(s) => setSelectedStartup(s)}
            onEditStartup={(s) => setEditingStartup(s)}
            selectedIds={selectedIds}
            onToggleSelect={(id) => {
              setSelectedIds(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
              );
            }}
            onSelectAllVisible={(ids) => {
              setSelectedIds(prev => [...new Set([...prev, ...ids])]);
            }}
            onClearVisibleSelection={(ids) => {
              setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            unverifiedSubFilter={unverifiedSubFilter}
            onUnverifiedSubFilterChange={setUnverifiedSubFilter}
            onAutoVerifyStartup={handleSingleAutoVerify}
          />
        ) : (
          <CohortAnalytics
            startups={activeStartups}
            targetView={targetView}
          />
        )}

      </main>

      {/* Slide-Over Account Dossier Drawer */}
      <AccountDrawer
        startup={selectedStartup}
        onClose={() => setSelectedStartup(null)}
        targetView={targetView}
        apiConfig={apiKeysConfig}
        financialAssumptions={pipelineAssumptions}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
        onUpdateStack={handleUpdateStack}
        onToggleVerify={handleToggleVerify}
        onDeleteAccount={handleDeleteAccount}
        onEditStartup={(s) => setEditingStartup(s)}
        onStartupAutoVerified={(updated) => {
          setSelectedStartup(updated);
        }}
        isGuest={!user}
      />

      {/* Bulk Actions Floating Toolbar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        totalFilteredCount={activeStartups.length}
        onSelectAllFiltered={() => setSelectedIds(activeStartups.map(s => s.id))}
        onClearSelection={() => setSelectedIds([])}
        onBulkDelete={handleBulkDelete}
        onBulkVerify={handleBulkVerify}
        onBulkAutoVerify={handleBulkAutoVerify}
        onExportCsv={handleExportCsv}
        isGuest={!user}
        isAutoVerifying={isBulkAutoVerifying}
      />

      {/* Modals */}
      <EditCompanyModal
        isOpen={!!editingStartup}
        onClose={() => setEditingStartup(null)}
        startup={editingStartup}
        onSave={handleSaveCompanyCorrections}
        isAdmin={isAdmin}
      />

      <ApiKeysModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
        config={apiKeysConfig}
        onSave={handleSaveApiKeys}
        isGuest={!user}
        onTriggerGuestPrompt={triggerGuestPrompt}
      />

      <PipelineMathModal
        isOpen={isPipelineMathOpen}
        onClose={() => setIsPipelineMathOpen(false)}
        assumptions={pipelineAssumptions}
        onSave={handleSavePipelineAssumptions}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUserChange={setUser}
      />

      {/* Non-Intrusive Guest Soft Prompt */}
      <GuestSoftPrompt
        isOpen={guestPromptOpen}
        onClose={() => setGuestPromptOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
        actionName={guestPromptAction}
      />

    </div>
  );
}
