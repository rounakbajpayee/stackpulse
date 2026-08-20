import React from 'react';
import { PieChart, BarChart3, Download, ExternalLink } from 'lucide-react';

export const VCPortfolioCharts: React.FC = () => {
  const cohorts = [
    {
      name: 'Y Combinator (W25 Batch)',
      total: 48,
      supabase: 68,
      firebase: 22,
      other: 10,
      highlights: 'Supabase is default backend across AI Coding Agents and Next.js full-stack builders.'
    },
    {
      name: 'a16z Speedrun (AI & Gaming)',
      total: 36,
      supabase: 59,
      firebase: 31,
      other: 10,
      highlights: 'High Firestore concentration in mobile/voice AI; prime targets for low-latency Postgres vector migration.'
    },
    {
      name: 'Sequoia Arc (Seed AI Startups)',
      total: 28,
      supabase: 64,
      firebase: 25,
      other: 11,
      highlights: 'Strong adoption of Supabase Auth + pgvector for legal and autonomous agent pipelines.'
    }
  ];

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
            Real-time backend database distribution across top tier venture accelerator cohorts
          </p>
        </div>
        <button
          onClick={() => alert('Exporting Partner Ecosystem Brief (PDF)...')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-[#1F2937] text-xs font-semibold transition-all hover:border-slate-700"
        >
          <Download className="w-3.5 h-3.5 text-[#3ECF8E]" />
          <span>Export Partner Brief (PDF)</span>
        </button>
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cohorts.map((cohort) => (
          <div key={cohort.name} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm">{cohort.name}</h3>
                <span className="text-xs text-slate-500 font-mono">{cohort.total} Startups</span>
              </div>

              {/* Progress Distribution Bar */}
              <div className="h-3 w-full rounded-full bg-[#0B0F19] overflow-hidden flex mb-3 p-0.5 border border-[#1F2937]">
                <div style={{ width: `${cohort.supabase}%` }} className="bg-[#3ECF8E] rounded-l-full" title={`Supabase: ${cohort.supabase}%`}></div>
                <div style={{ width: `${cohort.firebase}%` }} className="bg-[#F59E0B]" title={`Firebase: ${cohort.firebase}%`}></div>
                <div style={{ width: `${cohort.other}%` }} className="bg-slate-600 rounded-r-full" title={`Other: ${cohort.other}%`}></div>
              </div>

              {/* Breakdown Legend */}
              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#3ECF8E]"></span>
                    <span>Supabase Postgres</span>
                  </span>
                  <span className="font-semibold text-white">{cohort.supabase}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                    <span>Firebase Firestore</span>
                  </span>
                  <span className="font-semibold text-[#F59E0B]">{cohort.firebase}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <span>Other / Neon / Dynamo</span>
                  </span>
                  <span className="font-semibold text-slate-400">{cohort.other}%</span>
                </div>
              </div>
            </div>

            {/* Tactical Ecosystem Takeaway */}
            <div className="pt-3 border-t border-[#1F2937] text-[11px] text-slate-400 leading-relaxed bg-[#0B0F19]/40 -mx-5 -mb-5 p-4 rounded-b-xl">
              <span className="font-semibold text-slate-300">Partnership Takeaway: </span>
              {cohort.highlights}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
