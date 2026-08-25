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
  X,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Startup, TargetView, VerificationDepth, FinancialAssumptions } from '../lib/types';
import { TechBadge } from './TechBadge';
import { getGtmClassification, getProvenanceDepth } from '../lib/workspace-store';
import { normalizeFunctionalOntology, calculateCompanyArr, DEFAULT_FINANCIAL_ASSUMPTIONS } from '../lib/ontology';

interface LandscapeTableProps {
  startups: Startup[];
  targetView: TargetView;
  financialAssumptions?: FinancialAssumptions;
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

const VECTOR_FILTERS = [
  { label: 'All Vector Stores', value: 'all' },
  { label: 'pgvector (Native)', value: 'pgvector' },
  { label: 'Pinecone', value: 'Pinecone' },
  { label: 'Qdrant', value: 'Qdrant' },
  { label: 'Weaviate', value: 'Weaviate' },
  { label: 'Milvus', value: 'Milvus' },
  { label: 'None', value: 'None' },
];

const AUTH_FILTERS = [
  { label: 'All Auth Providers', value: 'all' },
  { label: 'Clerk', value: 'Clerk' },
  { label: 'Auth0', value: 'Auth0' },
  { label: 'Supabase Auth', value: 'Supabase Auth' },
  { label: 'Firebase Auth', value: 'Firebase Auth' },
  { label: 'NextAuth', value: 'NextAuth' },
];

export const LandscapeTable: React.FC<LandscapeTableProps> = ({
  startups,
  targetView,
  financialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS,
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
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [cohortFilter, setCohortFilter] = useState('all');
  const [vectorFilter, setVectorFilter] = useState('all');
  const [authFilter, setAuthFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Provenance Counts calculation for sub-pills
  const provenanceCounts = useMemo(() => {
    let surfaceFree = 0;
    let deepScraped = 0;
    let totalUnverified = 0;

    startups.forEach(s => {
      const isVerified = s.verification_status === 'verified' || (s.database_stack && s.database_stack !== 'Unknown');
      if (!isVerified) {
        totalUnverified++;
        const depth = getProvenanceDepth(s);
        if (depth === 'deep_scraped') deepScraped++;
        else surfaceFree++;
      }
    });

    return { surfaceFree, deepScraped, totalUnverified };
  }, [startups]);

  // Filtering pipeline
  const filteredStartups = useMemo(() => {
    return startups.filter(startup => {
      // 1. Search Query
      if (search) {
        const query = search.toLowerCase();
        const matchesName = startup.name.toLowerCase().includes(query);
        const matchesStack = (startup.database_stack || '').toLowerCase().includes(query);
        const matchesBatch = (startup.yc_batch || startup.batch || startup.category || '').toLowerCase().includes(query);
        const matchesUrl = (startup.website_url || startup.url || '').toLowerCase().includes(query);
        if (!matchesName && !matchesStack && !matchesBatch && !matchesUrl) {
          return false;
        }
      }

      // 2. Industry Filter
      if (industryFilter !== 'all') {
        const ind = startup.industry || 'B2B SaaS / DevTools';
        if (ind !== industryFilter) return false;
      }

      // 3. Cohort / Investor Filter
      if (cohortFilter !== 'all') {
        const inv = (startup.investor || '').toLowerCase();
        const batch = (startup.yc_batch || startup.batch || startup.category || '').toLowerCase();
        if (cohortFilter === 'yc' && !inv.includes('yc') && !batch.includes('w') && !batch.includes('s')) return false;
        if (cohortFilter === 'a16z' && !inv.includes('a16z') && !batch.includes('speedrun')) return false;
        if (cohortFilter === 'sequoia' && !inv.includes('sequoia') && !batch.includes('arc')) return false;
      }

      const ontology = normalizeFunctionalOntology(startup);

      // 4. Vector Filter
      if (vectorFilter !== 'all') {
        if (vectorFilter === 'None') {
          if (ontology.vector_engine !== 'None') return false;
        } else {
          if (!ontology.vector_engine.toLowerCase().includes(vectorFilter.toLowerCase())) return false;
        }
      }

      // 5. Auth Filter
      if (authFilter !== 'all') {
        if (!ontology.auth_provider.toLowerCase().includes(authFilter.toLowerCase())) return false;
      }

      // 6. GTM Status Filter
      const classification = getGtmClassification(startup, targetView);
      const isVerified = startup.verification_status === 'verified' || (startup.database_stack && startup.database_stack !== 'Unknown');

      if (statusFilter === 'verified') {
        return isVerified;
      } else if (statusFilter === 'champion') {
        return classification.isChampion;
      } else if (statusFilter === 'migration') {
        return classification.isTarget;
      } else if (statusFilter === 'unverified') {
        if (isVerified) return false;
        const depth = getProvenanceDepth(startup);
        if (unverifiedSubFilter === 'surface_free') return depth === 'surface_free';
        if (unverifiedSubFilter === 'deep_scraped') return depth === 'deep_scraped';
        if (unverifiedSubFilter === 'unscanned') return depth === 'unscanned';
        return true;
      }

      return true;
    });
  }, [startups, search, industryFilter, cohortFilter, vectorFilter, authFilter, statusFilter, unverifiedSubFilter, targetView]);

  // Pagination
  const totalPages = Math.ceil(filteredStartups.length / pageSize) || 1;
  const paginatedStartups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStartups.slice(start, start + pageSize);
  }, [filteredStartups, currentPage, pageSize]);

  const visibleIds = useMemo(() => paginatedStartups.map(s => s.id), [paginatedStartups]);
  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  return (
    <div className="space-y-4">
      
      {/* Top Filter Toolbar */}
      <div className="flex flex-col gap-3">
        
        {/* Main Status Filter Tabs & Counts */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => { onStatusFilterChange('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              All Startups ({startups.length})
            </button>

            <button
              onClick={() => { onStatusFilterChange('verified'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Verified Stacks ({startups.filter(s => s.database_stack && s.database_stack !== 'Unknown').length})
            </button>

            <button
              onClick={() => { onStatusFilterChange('champion'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'champion'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Native Champions
            </button>

            <button
              onClick={() => { onStatusFilterChange('migration'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'migration'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Migration Targets
            </button>

            <button
              onClick={() => { onStatusFilterChange('unverified'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'unverified'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Unverified ({provenanceCounts.totalUnverified})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search company, tech stack, domain..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Secondary Filters Bar (Industry, Cohort, Vector, Auth) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {INDUSTRIES.map(ind => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>

            {/* Cohort Filter */}
            <select
              value={cohortFilter}
              onChange={(e) => { setCohortFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {VC_COHORTS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Vector Layer Filter */}
            <select
              value={vectorFilter}
              onChange={(e) => { setVectorFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {VECTOR_FILTERS.map(vf => (
                <option key={vf.value} value={vf.value}>{vf.label}</option>
              ))}
            </select>

            {/* Auth Provider Filter */}
            <select
              value={authFilter}
              onChange={(e) => { setAuthFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {AUTH_FILTERS.map(af => (
                <option key={af.value} value={af.value}>{af.label}</option>
              ))}
            </select>
          </div>

          {/* Unverified Sub-Pills when Unverified Tab is Active */}
          {statusFilter === 'unverified' && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
              <button
                onClick={() => { onUnverifiedSubFilterChange('all'); setCurrentPage(1); }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  unverifiedSubFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500'
                }`}
              >
                All ({provenanceCounts.totalUnverified})
              </button>
              <button
                onClick={() => { onUnverifiedSubFilterChange('surface_free'); setCurrentPage(1); }}
                className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                  unverifiedSubFilter === 'surface_free' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold' : 'text-zinc-500 hover:text-amber-500'
                }`}
              >
                <span>⚡ Pending Deep Scrape</span>
                <span className="opacity-75">({provenanceCounts.surfaceFree})</span>
              </button>
              <button
                onClick={() => { onUnverifiedSubFilterChange('deep_scraped'); setCurrentPage(1); }}
                className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                  unverifiedSubFilter === 'deep_scraped' ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>🔒 Truly Unknown</span>
                <span className="opacity-75">({provenanceCounts.deepScraped})</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Main Data Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-950/50 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-3 pl-4 pr-2 w-8">
                  <button
                    onClick={() => {
                      if (isAllVisibleSelected) onClearVisibleSelection(visibleIds);
                      else onSelectAllVisible(visibleIds);
                    }}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Company & Domain</th>
                <th className="py-3 px-3">Cohort</th>
                <th className="py-3 px-3">6D Infrastructure Architecture</th>
                <th className="py-3 px-3">GTM Opportunity & ARR</th>
                <th className="py-3 px-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {paginatedStartups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <p className="text-sm font-semibold">No companies match your filters</p>
                    <p className="text-xs text-zinc-500 mt-1">Try clearing search terms or resetting filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedStartups.map(startup => {
                  const isSelected = selectedIds.includes(startup.id);
                  const classification = getGtmClassification(startup, targetView);
                  const depth = getProvenanceDepth(startup);
                  const ontology = normalizeFunctionalOntology(startup);
                  const modeledArr = calculateCompanyArr(startup, financialAssumptions, targetView);
                  const hasCustomArr = typeof startup.custom_arr_override === 'number';

                  return (
                    <tr
                      key={startup.id}
                      className={`hover:bg-zinc-50/75 dark:hover:bg-zinc-800/50 transition-colors group ${
                        isSelected ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2">
                        <button
                          onClick={() => onToggleSelect(startup.id)}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Company Name & Domain */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onSelectStartup(startup)}
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 dark:hover:text-emerald-400 text-left transition-colors flex items-center gap-1.5"
                          >
                            <span>{startup.name}</span>
                          </button>
                          <a
                            href={startup.website_url || startup.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 truncate max-w-[180px] flex items-center gap-1"
                          >
                            <span>{(startup.website_url || startup.url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                      </td>

                      {/* Cohort & Industry */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                            {startup.yc_batch || startup.batch || startup.category || 'Portfolio'}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                            {startup.industry || 'B2B SaaS'}
                          </span>
                        </div>
                      </td>

                      {/* 6D Infrastructure Architecture Chips */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                          {/* Primary Database */}
                          <TechBadge name={ontology.primary_database} targetView={targetView} />

                          {/* Vector Engine Chip (if active) */}
                          {ontology.vector_engine !== 'None' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              🧠 {ontology.vector_engine}
                            </span>
                          )}

                          {/* Auth Provider Chip (if active) */}
                          {ontology.auth_provider !== 'None' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              🔑 {ontology.auth_provider}
                            </span>
                          )}

                          {/* Cache Chip (if active) */}
                          {ontology.cache_layer !== 'None' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              ⚡ {ontology.cache_layer}
                            </span>
                          )}

                          {/* Unverified Badge if Unknown */}
                          {ontology.primary_database === 'Unknown' && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                              depth === 'deep_scraped'
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}>
                              {depth === 'deep_scraped' ? '🔒 Truly Unknown' : '⚡ Surface Scanned'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* GTM Opportunity & Modeled ARR */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          {classification.isChampion ? (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span>✓ Native Champion</span>
                            </span>
                          ) : modeledArr > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                                ${(modeledArr / 1000).toFixed(0)}k/yr
                              </span>
                              {hasCustomArr && (
                                <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Custom
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-400">
                              {depth === 'deep_scraped' ? 'Unassigned' : 'Pending Verification'}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                            {classification.label}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Row Edit Company Button */}
                          {onEditStartup && (
                            <button
                              onClick={() => onEditStartup(startup)}
                              className="p-1.5 text-zinc-400 hover:text-emerald-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Correct company intelligence & stack details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Auto-Verify for surface scanned */}
                          {onAutoVerifyStartup && depth === 'surface_free' && ontology.primary_database === 'Unknown' && (
                            <button
                              onClick={() => onAutoVerifyStartup(startup)}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg transition-colors"
                              title="Auto-verify this startup"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {/* Open Dossier Button */}
                          <button
                            onClick={() => onSelectStartup(startup)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3 h-3" />
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
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/30 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(filteredStartups.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(filteredStartups.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredStartups.length}</span> startups
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-zinc-700 dark:text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
