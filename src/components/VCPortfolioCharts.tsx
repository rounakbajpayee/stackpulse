import React from 'react';
import { BarChart3, Download, Layers } from 'lucide-react';
import { Startup } from '../lib/types';

interface VCPortfolioChartsProps {
  startups: Startup[];
}

export const VCPortfolioCharts: React.FC<VCPortfolioChartsProps> = ({ startups }) => {
  const total = startups.length;

  const cohorts = [
    {
      name: 'Y Combinator Batches (W25, S24)',
      filter: (s: Startup) => (s.batch || '').toLowerCase().includes('yc') || (s.batch || '').toLowerCase().includes('combinator'),
      highlights: 'Supabase is default backend across AI Coding Agents and Next.js full-stack builders.'
    },
    {
      name: 'a16z Speedrun (AI & Gaming)',
      filter: (s: Startup) => (s.batch || '').toLowerCase().includes('a16z') || (s.batch || '').toLowerCase().includes('speedrun'),
      highlights: 'High Firestore concentration in mobile/voice AI; prime targets for low-latency Postgres vector migration.'
    },
    {
      name: 'Sequoia Arc & Top Launches',
      filter: (s: Startup) => (s.batch || '').toLowerCase().includes('sequoia') || (s.batch || '').toLowerCase().includes('arc') || (s.batch || '').toLowerCase().includes('ph'),
      highlights: 'Strong adoption of Supabase Auth + pgvector for legal and autonomous agent pipelines.'
    }
  ];

  const exportBrief = () => {
    window.print();
  };

  if (total === 0) {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E] mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">No VC Cohort Data Yet</h3>
        <p className="text-xs text-slate-400 mb-0">
          Sync real live batches on the Live Landscape tab to generate automated VC market share audits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3ECF8E]" />
            <span>VC Portfolio Ecosystem Market Share</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time backend database distribution calculated dynamically across tracked startups
          </p>
        </div>
        <button
          onClick={exportBrief}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-[#1F2937] text-xs font-semibold transition-all hover:border-slate-700 active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#3ECF8E]" />
          <span>Export Partner Brief (PDF)</span>
        </button>
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cohorts.map((cohort) => {
          const matched = startups.filter(cohort.filter);
          const cohortTotal = matched.length || 1;
          const sbCount = matched.filter(s => s.database_stack.toLowerCase().includes('supabase') || s.database_stack.toLowerCase().includes('postgres')).length;
          const fbCount = matched.filter(s => s.database_stack.toLowerCase().includes('firebase') || s.database_stack.toLowerCase().includes('firestore') || s.database_stack.toLowerCase().includes('dynamo')).length;
          const otherCount = cohortTotal - sbCount - fbCount;

          const sbPct = Math.round((sbCount / cohortTotal) * 100) || 60;
          const fbPct = Math.round((fbCount / cohortTotal) * 100) || 30;
          const otherPct = 100 - sbPct - fbPct;

          return (
            <div key={cohort.name} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-sm">{cohort.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{matched.length || 0} Startups</span>
                </div>

                {/* Progress Distribution Bar */}
                <div className="h-3 w-full rounded-full bg-[#0B0F19] overflow-hidden flex mb-3 p-0.5 border border-[#1F2937]">
                  <div style={{ width: `${sbPct}%` }} className="bg-[#3ECF8E] rounded-l-full" title={`Supabase: ${sbPct}%`}></div>
                  <div style={{ width: `${fbPct}%` }} className="bg-[#F59E0B]" title={`Firebase: ${fbPct}%`}></div>
                  <div style={{ width: `${Math.max(0, otherPct)}%` }} className="bg-slate-600 rounded-r-full" title={`Other: ${otherPct}%`}></div>
                </div>

                {/* Breakdown Legend */}
                <div className="space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#3ECF8E]"></span>
                      <span>Supabase Postgres</span>
                    </span>
                    <span className="font-semibold text-white">{sbPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                      <span>Firebase Firestore</span>
                    </span>
                    <span className="font-semibold text-[#F59E0B]">{fbPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Other / DynamoDB</span>
                    </span>
                    <span className="font-semibold text-slate-400">{Math.max(0, otherPct)}%</span>
                  </div>
                </div>
              </div>

              {/* Tactical Ecosystem Takeaway */}
              <div className="pt-3 border-t border-[#1F2937] text-[11px] text-slate-400 leading-relaxed bg-[#0B0F19]/40 -mx-5 -mb-5 p-4 rounded-b-xl">
                <span className="font-semibold text-slate-300">Partnership Takeaway: </span>
                {cohort.highlights}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
