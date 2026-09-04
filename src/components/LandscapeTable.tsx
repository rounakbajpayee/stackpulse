import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Database,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Startup } from '../lib/types';
import { InfoTooltip } from './InfoTooltip';

interface LandscapeTableProps {
  startups: Startup[];
  onSelectStartup: (startup: Startup) => void;
  onSync?: () => void;
  isSyncing?: boolean;
  externalFilter?: string | null;
  onClearExternalFilter?: () => void;
}

export const LandscapeTable: React.FC<LandscapeTableProps> = ({
  startups,
  onSelectStartup,
  onSync,
  isSyncing,
  externalFilter,
  onClearExternalFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'supabase' | 'firebase' | 'mongo' | 'dynamo' | 'vector'>('all');
  const [cohortFilter, setCohortFilter] = useState<'all' | 'yc' | 'a16z' | 'sequoia'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium'>('all');
  
  // Pagination State (20 items per page for 60fps performance)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // React to external distribution bar filter clicks (Feature 2)
  React.useEffect(() => {
    if (externalFilter) {
      if (['supabase', 'firebase', 'mongo', 'dynamo', 'vector'].includes(externalFilter)) {
        setFilter(externalFilter as any);
      }
      setCurrentPage(1);
    }
  }, [externalFilter]);

  const filteredStartups = startups.filter((s) => {
    const stackLower = (s.database_stack || '').toLowerCase();
    const nameLower = (s.name || '').toLowerCase();
    const catLower = (s.category || '').toLowerCase();
    const termLower = searchTerm.toLowerCase();

    const matchesSearch =
      nameLower.includes(termLower) ||
      catLower.includes(termLower) ||
      stackLower.includes(termLower);

    if (!matchesSearch) return false;
    if (filter === 'supabase' && !(stackLower.includes('supabase') || stackLower.includes('postgres'))) return false;
    if (filter === 'firebase' && !(stackLower.includes('firebase') || stackLower.includes('firestore'))) return false;
    if (filter === 'mongo' && !stackLower.includes('mongo')) return false;
    if (filter === 'dynamo' && !(stackLower.includes('dynamo') || stackLower.includes('amplify'))) return false;
    if (filter === 'vector' && !((s.vector_search || '').includes('pgvector') || (s.vector_search || '').includes('Pinecone') || (s.vector_search || '').includes('Qdrant'))) return false;

    // Feature 4: Cohort Filtering
    if (cohortFilter === 'yc') {
      const b = (s.batch || '').toLowerCase();
      if (!b.includes('yc') && !b.includes('combinator') && !b.includes('w2') && !b.includes('s2')) return false;
    } else if (cohortFilter === 'a16z') {
      const b = (s.batch || '').toLowerCase();
      if (!b.includes('a16z') && !b.includes('speedrun')) return false;
    } else if (cohortFilter === 'sequoia') {
      const b = (s.batch || '').toLowerCase();
      if (!b.includes('sequoia') && !b.includes('arc') && !b.includes('ph') && !b.includes('show hn')) return false;
    }

    // Feature 4: Conviction Score Triage
    const score = parseInt(s.migration_opportunity_score) || 0;
    if (scoreFilter === 'high' && score < 80) return false;
    if (scoreFilter === 'medium' && (score < 50 || score >= 80)) return false;

    return true;
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredStartups.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStartups = filteredStartups.slice(startIndex, startIndex + pageSize);

  const getStackBadge = (stack: string) => {
    const s = (stack || '').toLowerCase();
    if (s.includes('supabase') || s.includes('postgres')) {
      return {
        classes: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/30',
        icon: <ShieldCheck className="w-3 h-3 text-[#3ECF8E]" />
      };
    }
    if (s.includes('firebase') || s.includes('firestore')) {
      return {
        classes: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
        icon: <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
      };
    }
    if (s.includes('mongo')) {
      return {
        classes: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
        icon: <Database className="w-3 h-3 text-emerald-400" />
      };
    }
    if (s.includes('dynamo') || s.includes('amplify')) {
      return {
        classes: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
        icon: <Database className="w-3 h-3 text-orange-400" />
      };
    }
    if (s.includes('planetscale')) {
      return {
        classes: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
        icon: <Database className="w-3 h-3 text-purple-400" />
      };
    }
    return {
      classes: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: <Database className="w-3 h-3 text-slate-400" />
    };
  };

  return (
    <div className="bg-[#111827] border border-white/[0.08] rounded-xl shadow-xl relative z-10">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-white/[0.08] flex flex-col gap-3 bg-[#111827]/80 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, category, database stack (e.g. Supabase, Mongo, Firebase)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              disabled={startups.length === 0}
              className="w-full bg-[#0B0F19] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#3ECF8E]/50 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Feature 4: Composable Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Cohort Select */}
            <select
              value={cohortFilter}
              onChange={(e) => {
                setCohortFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-[#0B0F19] text-slate-300 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#3ECF8E]/40"
            >
              <option value="all">All Cohorts</option>
              <option value="yc">YC (W25, S24, W24)</option>
              <option value="a16z">a16z Speedrun</option>
              <option value="sequoia">Sequoia Arc</option>
            </select>

            {/* Conviction Score Select */}
            <select
              value={scoreFilter}
              onChange={(e) => {
                setScoreFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-[#0B0F19] text-slate-300 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#3ECF8E]/40"
            >
              <option value="all">All Conviction Scores</option>
              <option value="high">High Priority (≥80)</option>
              <option value="medium">Medium Priority (50–79)</option>
            </select>
          </div>
        </div>

        {/* Database Stack Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/[0.04]">
          <span className="text-[11px] font-mono text-slate-400 mr-1">STACK:</span>
          {[
            { id: 'all', label: 'All Startups' },
            { id: 'supabase', label: 'Supabase Native' },
            { id: 'firebase', label: 'Firebase Firestore' },
            { id: 'mongo', label: 'MongoDB Atlas' },
            { id: 'dynamo', label: 'AWS DynamoDB' },
            { id: 'vector', label: 'Vector DBs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id as any);
                setCurrentPage(1);
                if (onClearExternalFilter) onClearExternalFilter();
              }}
              disabled={startups.length === 0}
              className={`btn-tactile px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30 font-semibold'
                  : 'bg-[#0B0F19] text-slate-400 border border-white/[0.08] hover:text-white hover:border-white/[0.15] disabled:opacity-40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zero State */}
      {startups.length === 0 ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E] mb-4 glow-supabase">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">No Startups Ingested Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            StackPulse tracks live architectures across Firebase, MongoDB, DynamoDB, and Supabase. Click below to crawl real live feeds.
          </p>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold text-xs transition-all shadow-lg shadow-[#3ECF8E]/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Running Live Multi-Stack Crawler...' : 'Run Live Ingestion Sync (250+)'}</span>
          </button>
        </div>
      ) : (
        /* Populated Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19]/60 text-slate-400 uppercase font-semibold text-[11px] border-b border-[#1F2937] tracking-wider relative z-20">
              <tr>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Database Stack</th>
                <th className="py-3.5 px-4">Vector Search</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center relative">
                    <span>Migration Opportunity</span>
                    <InfoTooltip
                      title="Migration Scoring Algorithm"
                      position="bottom-right"
                      breakdown={[
                        { label: '1. Relational Deficit (Firestore/Mongo)', value: '+40 pts', detail: 'Inability to execute SQL JOINs on LLM memory' },
                        { label: '2. Vector Fragmentation (Pinecone)', value: '+30 pts', detail: 'Separate network hop & vendor double-billing' },
                        { label: '3. Row Level Security Absence', value: '+15 pts', detail: 'Lack of native DB-level multi-tenant isolation' },
                        { label: '4. Framework Synergy (Next.js/Python)', value: '+15 pts', detail: 'Direct match for Supabase SDK architecture' }
                      ]}
                      summaryFormula="Opportunity Score = Sum of Architecture Friction Points (Max 100%)"
                      source="PostgreSQL vs. NoSQL architectural whitepapers and Supabase pgvector latency benchmarks (co-located vs. multi-hop vector stores)."
                    />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">AE Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-slate-300">
              {paginatedStartups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No startups match your search filter.
                  </td>
                </tr>
              ) : (
                paginatedStartups.map((startup) => {
                  const scoreNum = parseInt(startup.migration_opportunity_score) || 50;
                  const isHigh = scoreNum >= 80;
                  const isSupabase =
                    (startup.database_stack || '').toLowerCase().includes('supabase') ||
                    (startup.database_stack || '').toLowerCase().includes('postgres');

                  const badge = getStackBadge(startup.database_stack);

                  return (
                    <tr
                      key={startup.id}
                      className="hover:bg-[#1F2937]/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectStartup(startup)}
                    >
                      {/* Company Name & Batch */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSupabase 
                              ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/20' 
                              : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                          }`}>
                            {(startup.name || 'AI').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{startup.name}</span>
                              {startup.url && (
                                <a
                                  href={startup.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-500 hover:text-[#3ECF8E] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{startup.batch || 'Live Feed'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-300 font-medium">{startup.category}</td>

                      {/* Database Stack */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badge.classes}`}
                        >
                          {badge.icon}
                          <span>{startup.database_stack}</span>
                        </span>
                      </td>

                      {/* Vector Search */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {startup.vector_search}
                      </td>

                      {/* Migration Opportunity Score & Progress Bar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isHigh
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : scoreNum >= 50
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isHigh ? `High ${startup.migration_opportunity_score}` : scoreNum >= 50 ? `Med ${startup.migration_opportunity_score}` : `Low ${startup.migration_opportunity_score}`}
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? 'bg-emerald-500' : scoreNum >= 50 ? 'bg-amber-500' : 'bg-slate-600'
                              }`}
                              style={{ width: startup.migration_opportunity_score }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStartup(startup);
                          }}
                          className={`btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isHigh
                              ? 'bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold shadow-sm shadow-[#3ECF8E]/20'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08]'
                          }`}
                        >
                          <span>{isHigh ? 'Generate Pitch' : 'View Profile'}</span>
                          <span>→</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with Pagination Controls */}
      <div className="p-4 border-t border-white/[0.08] bg-[#0B0F19]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 rounded-b-xl">
        <div>
          Showing <span className="font-semibold text-white font-mono">{filteredStartups.length > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-white font-mono">{Math.min(startIndex + pageSize, filteredStartups.length)}</span> of{' '}
          <span className="font-semibold text-white font-mono">{filteredStartups.length}</span> startups ({startups.length} total in DB)
        </div>

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-tactile p-1.5 rounded-lg bg-[#111827] border border-white/[0.08] hover:border-white/[0.15] disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-tactile p-1.5 rounded-lg bg-[#111827] border border-white/[0.08] hover:border-white/[0.15] disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 text-[#3ECF8E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]"></span>
          <span>Live multi-stack intelligence synced</span>
        </div>
      </div>
    </div>
  );
};
