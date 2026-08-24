import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  CheckSquare,
  Square,
  Info,
  RotateCw,
  Edit3,
  X
} from 'lucide-react';
import { Startup, TargetView, VerificationDepth } from '../lib/types';
import { TechBadge } from './TechBadge';
import { getGtmClassification, getProvenanceDepth } from '../lib/workspace-store';

interface LandscapeTableProps {
  startups: Startup[];
  targetView: TargetView;
  onSelectStartup: (startup: Startup) => void;
  onEditStartup?: (startup: Startup) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAllVisible: (ids: string[]) => void;
  onClearVisibleSelection: (ids: string[]) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  unverifiedSubFilter: 'all' | 'surface_free' | 'deep_scraped' | 'unscanned';
  onUnverifiedSubFilterChange: (sub: 'all' | 'surface_free' | 'deep_scraped' | 'unscanned') => void;
  onAutoVerifyStartup?: (startup: Startup) => void;
}

const INDUSTRIES: { label: string; value: string }[] = [
  { label: 'All Industries', value: 'all' },
  { label: 'B2B SaaS & DevTools', value: 'B2B SaaS / DevTools' },
  { label: 'AI & Machine Learning', value: 'AI / Machine Learning' },
  { label: 'FinTech & Payments', value: 'FinTech / Payments' },
  { label: 'Healthcare & Bio', value: 'Healthcare / Bio' },
  { label: 'Consumer & E-Com', value: 'E-Commerce / Consumer' },
  { label: 'Hardware & Industrial', value: 'Hardware / Industrial' },
];

const VC_COHORTS = [
  { label: 'All Cohorts', value: 'all' },
  { label: 'YC Batches', value: 'yc' },
  { label: 'a16z Speedrun', value: 'a16z' },
  { label: 'Sequoia Arc', value: 'sequoia' },
];

export const LandscapeTable: React.FC<LandscapeTableProps> = ({
  startups,
  targetView,
  onSelectStartup,
  onEditStartup,
  selectedIds,
  onToggleSelect,
  onSelectAllVisible,
  onClearVisibleSelection,
  statusFilter,
  onStatusFilterChange,
  unverifiedSubFilter,
  onUnverifiedSubFilterChange,
  onAutoVerifyStartup
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const PAGE_SIZE = 25;

  // Filter pipeline
  const filteredStartups = useMemo(() => {
    return startups.filter(s => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchDb = (s.database_stack || '').toLowerCase().includes(q);
        const matchVector = (s.vector_search || '').toLowerCase().includes(q);
        const matchUrl = (s.url || '').toLowerCase().includes(q);
        if (!matchName && !matchDb && !matchVector && !matchUrl) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all') {
        const classification = getGtmClassification(s, targetView);
        const depth = getProvenanceDepth(s);

        if (statusFilter === 'champion' && classification.status !== 'champion') return false;
        if (statusFilter === 'migration' && classification.status !== 'migration') return false;
        if (statusFilter === 'verified' && (s.database_stack === 'Unknown' || !s.database_stack)) return false;
        
        // Unverified with Sub-Filters
        if (statusFilter === 'unverified') {
          if (s.database_stack !== 'Unknown' && s.database_stack) return false;
          if (unverifiedSubFilter === 'surface_free' && depth !== 'surface_free') return false;
          if (unverifiedSubFilter === 'deep_scraped' && depth !== 'deep_scraped') return false;
          if (unverifiedSubFilter === 'unscanned' && depth !== 'unscanned') return false;
        }

        if (statusFilter === 'ai_vector' && (!s.vector_search || s.vector_search === 'None')) return false;
      }

      // 3. Industry Filter
      if (selectedIndustry !== 'all' && s.industry !== selectedIndustry) {
        return false;
      }

      // 4. VC Cohort Filter
      if (selectedCohort !== 'all') {
        const inv = (s.investor || '').toLowerCase();
        if (selectedCohort === 'yc' && !inv.includes('yc')) return false;
        if (selectedCohort === 'a16z' && !inv.includes('a16z')) return false;
        if (selectedCohort === 'sequoia' && !inv.includes('sequoia')) return false;
      }

      return true;
    });
  }, [startups, searchQuery, statusFilter, unverifiedSubFilter, selectedIndustry, selectedCohort, targetView]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, unverifiedSubFilter, selectedIndustry, selectedCohort, targetView]);

  const totalPages = Math.max(1, Math.ceil(filteredStartups.length / PAGE_SIZE));
  const paginatedStartups = filteredStartups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const visibleIds = paginatedStartups.map(s => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  const unverifiedCounts = useMemo(() => {
    const unverifiedList = startups.filter(s => s.database_stack === 'Unknown' || !s.database_stack);
    const surfaceFree = unverifiedList.filter(s => getProvenanceDepth(s) === 'surface_free').length;
    const deepScraped = unverifiedList.filter(s => getProvenanceDepth(s) === 'deep_scraped').length;
    const unscanned = unverifiedList.filter(s => getProvenanceDepth(s) === 'unscanned').length;
    return { total: unverifiedList.length, surfaceFree, deepScraped, unscanned };
  }, [startups]);

  const handleToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      onClearVisibleSelection(visibleIds);
    } else {
      onSelectAllVisible(visibleIds);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter Controls */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-sm">
        
        {/* Search & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, database (e.g. Postgres, Mongo), or vector..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Accounts' },
              { id: 'verified', label: 'Verified Stacks' },
              { id: 'champion', label: 'Champions' },
              { id: 'migration', label: 'Migration Targets' },
              { id: 'unverified', label: `Unverified (${unverifiedCounts.total.toLocaleString()})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onStatusFilterChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Unverified Bifurcation Sub-Filter Bar */}
        {statusFilter === 'unverified' && (
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <span>Scan Depth:</span>
                <button
                  onClick={() => setActiveInfoModal('unverified_bifurcation')}
                  className="text-zinc-400 hover:text-emerald-500"
                  title="Explain unverified scan depth categories"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </span>

              <button
                onClick={() => onUnverifiedSubFilterChange('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  unverifiedSubFilter === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                All Unverified ({unverifiedCounts.total})
              </button>

              <button
                onClick={() => onUnverifiedSubFilterChange('surface_free')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  unverifiedSubFilter === 'surface_free'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                }`}
                title="Free signals scanned (GitHub/ATS/Bundles). Scraper proxy was skipped."
              >
                <span>⚡ Pending Deep Scrape ({unverifiedCounts.surfaceFree})</span>
              </button>

              <button
                onClick={() => onUnverifiedSubFilterChange('deep_scraped')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  unverifiedSubFilter === 'deep_scraped'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
                title="Scanned exhaustively across all 6 tiers. No public database found."
              >
                <span>🔒 Truly Unknown ({unverifiedCounts.deepScraped})</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-zinc-400">
              {unverifiedSubFilter === 'surface_free' ? 'Actionable for 1-Click Verification' : 'Permanently Cached'}
            </span>
          </div>
        )}

        {/* Second Row: Industry & Cohort Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            {/* Industry Selector */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer dark:[color-scheme:dark] [color-scheme:light]"
            >
              {INDUSTRIES.map(ind => (
                <option key={ind.value} value={ind.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">
                  {ind.label}
                </option>
              ))}
            </select>

            {/* Cohort Selector */}
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer dark:[color-scheme:dark] [color-scheme:light]"
            >
              {VC_COHORTS.map(c => (
                <option key={c.value} value={c.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono font-medium">
            Showing {filteredStartups.length.toLocaleString()} matching accounts
          </div>
        </div>

      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAllVisible}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    title="Select / Deselect all on this page"
                  >
                    {allVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[180px]">Company & Sector</th>
                <th className="py-3 px-3 min-w-[100px]">Cohort</th>
                <th className="py-3 px-3 min-w-[180px]">Database Architecture</th>
                <th className="py-3 px-3 min-w-[120px]">Vector Layer</th>
                <th className="py-3 px-3 min-w-[150px]">
                  <div className="flex items-center gap-1">
                    <span>Provenance & GTM</span>
                    <button
                      onClick={() => setActiveInfoModal('provenance_column')}
                      className="text-zinc-400 hover:text-emerald-500"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-3 w-32 text-right pr-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
              {paginatedStartups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 dark:text-zinc-400 font-sans text-xs">
                    No accounts found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedStartups.map((startup) => {
                  const isSelected = selectedIds.includes(startup.id);
                  const classification = getGtmClassification(startup, targetView);
                  const depth = getProvenanceDepth(startup);
                  const isUnknown = startup.database_stack === 'Unknown' || !startup.database_stack;

                  return (
                    <tr
                      key={startup.id}
                      className={`hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td 
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(startup.id);
                        }}
                      >
                        <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Company Name & Sector */}
                      <td 
                        className="py-2.5 px-3"
                        onClick={() => onSelectStartup(startup)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-sans text-xs">
                            {startup.name}
                          </span>
                          {startup.url && (
                            <a
                              href={startup.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                          {startup.industry}
                        </div>
                      </td>

                      {/* Investor / Cohort */}
                      <td 
                        className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300 font-sans"
                        onClick={() => onSelectStartup(startup)}
                      >
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium border border-zinc-200 dark:border-zinc-700">
                          {startup.yc_batch || startup.batch || startup.category || 'YC'}
                        </span>
                      </td>

                      {/* Database Stack */}
                      <td 
                        className="py-2.5 px-3"
                        onClick={() => onSelectStartup(startup)}
                      >
                        {isUnknown ? (
                          <span className="text-zinc-400 dark:text-zinc-500 italic">Unverified</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {startup.database_stack.split('+').map((d, i) => (
                              <TechBadge key={i} tech={d.trim()} />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Vector Layer */}
                      <td 
                        className="py-2.5 px-3"
                        onClick={() => onSelectStartup(startup)}
                      >
                        <TechBadge tech={startup.vector_search} isVector />
                      </td>

                      {/* Provenance & GTM Status */}
                      <td 
                        className="py-2.5 px-3"
                        onClick={() => onSelectStartup(startup)}
                      >
                        {isUnknown ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            depth === 'surface_free'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : depth === 'deep_scraped'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {depth === 'surface_free' ? 'Surface Scanned ⚡' : depth === 'deep_scraped' ? 'Truly Unknown 🔒' : 'Unscanned'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            classification.status === 'champion'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : classification.status === 'migration'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {classification.label}
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit + Verify + Arrow */}
                      <td 
                        className="py-2.5 px-3 text-right pr-4"
                        onClick={() => onSelectStartup(startup)}
                      >
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Row Edit Button */}
                          {onEditStartup && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditStartup(startup);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Correct company stack, vector layer, or website"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isUnknown && depth === 'surface_free' && onAutoVerifyStartup && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onAutoVerifyStartup(startup);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                              title="Run missing deep scrape step"
                            >
                              Verify ⚡
                            </button>
                          )}

                          <button className="p-1 rounded text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-950">
          <div className="text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Info Modal for Provenance Depth & Bifurcation */}
      {activeInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setActiveInfoModal(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Unverified Accounts & Provenance Caching
                </h3>
              </div>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 block mb-0.5">
                  ⚡ Surface Scanned (Pending Deep Scrape):
                </strong>
                These startups were inspected through zero-cost signals (GitHub monorepos, Ashby/Greenhouse ATS job boards, and JS client bundles). No public database was found, but the deep search proxy step was skipped due to quota limits. You can click <em>"Verify ⚡"</em> to run only the missing scraper step.
              </div>

              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 block mb-0.5">
                  🔒 Truly Unknown (Exhaustive Scan):
                </strong>
                These startups underwent all 6 enrichment tiers (including ScraperAPI and Groq LLM) with zero public database artifacts discovered. They are permanently cached so no credits will ever be wasted on them again.
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
