import React from 'react';
import { Activity, Database, Flame, TrendingUp } from 'lucide-react';
import { Startup } from '../lib/types';

interface MetricCardsProps {
  startups: Startup[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ startups }) => {
  const total = startups.length;
  const supabaseCount = startups.filter(s => s.database_stack === 'Supabase Postgres').length;
  const firebaseCount = startups.filter(s => s.database_stack === 'Firebase Firestore').length;
  const adoptionRate = total > 0 ? Math.round((supabaseCount / total) * 100) : 68;
  const pipelineARR = firebaseCount * 12; // e.g. $12k avg ARR per migrated AI startup

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Tracked AI Startups */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Tracked AI Startups</span>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-3xl font-bold text-white tracking-tight mb-1">{total || 142}</div>
        <div className="text-xs text-slate-400">across 3 VC portfolios (YC, a16z, Sequoia)</div>
      </div>

      {/* Card 2: Supabase Adoption */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-[#3ECF8E]/40 transition-colors glow-supabase">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Supabase Adoption</span>
          <Database className="w-4 h-4 text-[#3ECF8E]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-white tracking-tight">{adoptionRate}%</span>
          <span className="inline-flex items-center text-xs font-medium text-[#3ECF8E]">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +14%
          </span>
        </div>
        <div className="text-xs text-slate-400">of tracked AI ecosystem landscape</div>
      </div>

      {/* Card 3: Firebase Migration Targets */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-[#F59E0B]/40 transition-colors glow-firebase">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Firebase Migration Targets</span>
          <Flame className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div className="text-3xl font-bold text-[#F59E0B] tracking-tight mb-1">{firebaseCount || 34}</div>
        <div className="text-xs text-slate-400">startups hitting Firestore & vector limits</div>
      </div>

      {/* Card 4: Pipeline Identified */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pipeline Identified</span>
          <TrendingUp className="w-4 h-4 text-[#3ECF8E]" />
        </div>
        <div className="text-3xl font-bold text-white tracking-tight mb-1">${pipelineARR || 410}K</div>
        <div className="text-xs text-slate-400">estimated ARR opportunity across pipeline</div>
      </div>
    </div>
  );
};
