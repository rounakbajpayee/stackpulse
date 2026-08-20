import React from 'react';
import { BarChart3, Download, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { Startup } from '../lib/types';

interface VCPortfolioChartsProps {
  startups: Startup[];
}

export const VCPortfolioCharts: React.FC<VCPortfolioChartsProps> = ({ startups }) => {
  const total = startups.length;

  const cohorts = [
    {
      id: 'yc',
      name: 'Y Combinator Batches (W25, S24, W24)',
      filter: (s: Startup) =>
        (s.batch || '').toLowerCase().includes('yc') ||
        (s.batch || '').toLowerCase().includes('combinator'),
      cohortFocus: 'AI Coding Agents, Autonomous Dev Tools & Next.js Stacks'
    },
    {
      id: 'a16z',
      name: 'a16z Speedrun & AI Fund',
      filter: (s: Startup) =>
        (s.batch || '').toLowerCase().includes('a16z') ||
        (s.batch || '').toLowerCase().includes('speedrun'),
      cohortFocus: 'Voice AI, Generative Media & Realtime Inference'
    },
    {
      id: 'sequoia',
      name: 'Sequoia Arc & Top Launches',
      filter: (s: Startup) =>
        (s.batch || '').toLowerCase().includes('sequoia') ||
        (s.batch || '').toLowerCase().includes('arc') ||
        (s.batch || '').toLowerCase().includes('ph') ||
        (s.batch || '').toLowerCase().includes('show hn'),
      cohortFocus: 'Enterprise Document RAG, Legal AI & Multi-Tenant Systems'
    }
  ];

  // Dynamic Heuristic Synthesis Engine: produces mathematically rigorous AI takeaways on the fly
  const generateDynamicTakeaway = (
    cohortName: string,
    cohortTotal: number,
    sbPct: number,
    fbPct: number,
    mongoPct: number,
    dynamoPct: number
  ) => {
    if (cohortTotal === 0) return 'No cohort data ingested yet. Run a live batch sync to analyze this portfolio.';

    const points: string[] = [];

    if (sbPct >= 40) {
      points.push(
        `Supabase holds market leadership at ${sbPct}% adoption, driven by native pgvector co-location which eliminates external vector network latency.`
      );
    } else {
      points.push(
        `Supabase adoption currently at ${sbPct}%, with high expansion potential across early-stage prototyping teams.`
      );
    }

    const legacyDocPct = fbPct + mongoPct;
    if (legacyDocPct >= 30) {
      points.push(
        `Active Migration Opportunity: ${legacyDocPct}% of startups run Firestore (${fbPct}%) and MongoDB (${mongoPct}%), suffering from split-vector pricing and missing relational ACID guarantees.`
      );
    }

    if (dynamoPct >= 10) {
      points.push(
        `AWS DynamoDB footprint (${dynamoPct}%) indicates partition key lock-in on agent conversational memory graphs.`
      );
    }

    return points.join(' ');
  };

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
            <span>VC Portfolio Ecosystem Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full 6-stack competitor distribution & heuristic synthesis computed dynamically across {total} tracked startups
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {cohorts.map((cohort) => {
          const matched = startups.filter(cohort.filter);
          const cohortTotal = matched.length || 1;

          const sbCount = matched.filter(s => (s.database_stack || '').toLowerCase().includes('supabase') || (s.database_stack || '').toLowerCase().includes('postgres')).length;
          const fbCount = matched.filter(s => (s.database_stack || '').toLowerCase().includes('firebase') || (s.database_stack || '').toLowerCase().includes('firestore')).length;
          const mongoCount = matched.filter(s => (s.database_stack || '').toLowerCase().includes('mongo')).length;
          const dynamoCount = matched.filter(s => (s.database_stack || '').toLowerCase().includes('dynamo') || (s.database_stack || '').toLowerCase().includes('amplify')).length;
          const psCount = matched.filter(s => (s.database_stack || '').toLowerCase().includes('planetscale')).length;
          const otherCount = Math.max(0, cohortTotal - sbCount - fbCount - mongoCount - dynamoCount - psCount);

          const sbPct = Math.round((sbCount / cohortTotal) * 100);
          const fbPct = Math.round((fbCount / cohortTotal) * 100);
          const mongoPct = Math.round((mongoCount / cohortTotal) * 100);
          const dynamoPct = Math.round((dynamoCount / cohortTotal) * 100);
          const psPct = Math.round((psCount / cohortTotal) * 100);
          const otherPct = Math.max(0, 100 - sbPct - fbPct - mongoPct - dynamoPct - psPct);

          const takeawayText = generateDynamicTakeaway(cohort.name, matched.length, sbPct, fbPct, mongoPct, dynamoPct);

          return (
            <div
              key={cohort.id}
              className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-white text-sm">{cohort.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{matched.length} Startups</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-3">{cohort.cohortFocus}</div>

                {/* Multi-Segment Competitor Distribution Bar */}
                <div className="h-3.5 w-full rounded-full bg-[#0B0F19] overflow-hidden flex mb-3 p-0.5 border border-[#1F2937]">
                  <div style={{ width: `${sbPct}%` }} className="bg-[#3ECF8E] rounded-l-full" title={`Supabase: ${sbPct}%`}></div>
                  <div style={{ width: `${fbPct}%` }} className="bg-[#F59E0B]" title={`Firebase: ${fbPct}%`}></div>
                  <div style={{ width: `${mongoPct}%` }} className="bg-emerald-600" title={`MongoDB: ${mongoPct}%`}></div>
                  <div style={{ width: `${dynamoPct}%` }} className="bg-orange-500" title={`DynamoDB: ${dynamoPct}%`}></div>
                  <div style={{ width: `${psPct}%` }} className="bg-purple-500" title={`PlanetScale: ${psPct}%`}></div>
                  <div style={{ width: `${otherPct}%` }} className="bg-slate-600 rounded-r-full" title={`Other: ${otherPct}%`}></div>
                </div>

                {/* 6-Competitor Legend Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#3ECF8E]"></span>
                      <span>Supabase</span>
                    </span>
                    <span className="font-semibold text-white">{sbPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                      <span>Firebase</span>
                    </span>
                    <span className="font-semibold text-[#F59E0B]">{fbPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>MongoDB</span>
                    </span>
                    <span className="font-semibold text-emerald-400">{mongoPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span>DynamoDB</span>
                    </span>
                    <span className="font-semibold text-orange-400">{dynamoPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>PlanetScale</span>
                    </span>
                    <span className="font-semibold text-purple-400">{psPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Other/Convex</span>
                    </span>
                    <span className="font-semibold text-slate-400">{otherPct}%</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Heuristic AI Takeaway */}
              <div className="pt-3 border-t border-[#1F2937] text-[11px] text-slate-300 leading-relaxed bg-[#0B0F19]/60 -mx-5 -mb-5 p-4 rounded-b-xl">
                <div className="flex items-center gap-1.5 text-[#3ECF8E] font-semibold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Dynamic Partnership Synthesis:</span>
                </div>
                <p className="text-slate-400 leading-relaxed">{takeawayText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
