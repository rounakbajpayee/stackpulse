import React, { useState } from 'react';
import { Search, Sparkles, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Startup } from '../lib/types';

interface LandscapeTableProps {
  startups: Startup[];
  onSelectStartup: (startup: Startup) => void;
}

export const LandscapeTable: React.FC<LandscapeTableProps> = ({ startups, onSelectStartup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'supabase' | 'firebase' | 'vector'>('all');

  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.database_stack.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'supabase') return s.database_stack === 'Supabase Postgres';
    if (filter === 'firebase') return s.database_stack === 'Firebase Firestore';
    if (filter === 'vector') return s.vector_search.includes('pgvector') || s.vector_search.includes('Pinecone');
    return true;
  });

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111827]/50">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, category, database stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3ECF8E] transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Startups' },
            { id: 'supabase', label: 'Supabase Native' },
            { id: 'firebase', label: 'Firebase Migration Target' },
            { id: 'vector', label: 'Vector DB Users' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tab.id
                  ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30 font-semibold'
                  : 'bg-[#0B0F19] text-slate-400 border border-[#1F2937] hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0F19]/60 text-slate-400 uppercase font-semibold text-[11px] border-b border-[#1F2937] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Database Stack</th>
              <th className="py-3.5 px-4">Vector Search</th>
              <th className="py-3.5 px-4">Migration Opportunity</th>
              <th className="py-3.5 px-4 text-right">AE Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-slate-300">
            {filteredStartups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No startups match your search criteria.
                </td>
              </tr>
            ) : (
              filteredStartups.map((startup) => {
                const scoreNum = parseInt(startup.migration_opportunity_score) || 50;
                const isHigh = scoreNum >= 80;
                const isSupabase = startup.database_stack === 'Supabase Postgres';

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
                          {startup.name.substring(0, 2).toUpperCase()}
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
                          <div className="text-[11px] text-slate-500">{startup.batch || 'YC W25'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-300 font-medium">{startup.category}</td>

                    {/* Database Stack */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                          isSupabase
                            ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/30'
                            : startup.database_stack === 'Firebase Firestore'
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isSupabase && <ShieldCheck className="w-3 h-3" />}
                        {startup.database_stack === 'Firebase Firestore' && <AlertTriangle className="w-3 h-3" />}
                        {startup.database_stack}
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isHigh
                            ? 'bg-[#3ECF8E]/15 hover:bg-[#3ECF8E]/25 text-[#3ECF8E] border border-[#3ECF8E]/30 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isHigh ? 'Generate AE Pitch' : 'View Profile'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1F2937] bg-[#0B0F19]/40 flex items-center justify-between text-xs text-slate-500">
        <div>Showing {filteredStartups.length} of {startups.length} tracked AI startups</div>
        <div className="flex items-center gap-1 text-[#3ECF8E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]"></span>
          <span>Live data synced with Supabase Postgres</span>
        </div>
      </div>
    </div>
  );
};
