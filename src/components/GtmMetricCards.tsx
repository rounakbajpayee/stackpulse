import React, { useState } from 'react';
import { Database, ShieldCheck, DollarSign, Cpu, ArrowUpRight, Info, X } from 'lucide-react';
import { MetricSummary, TargetView } from '../lib/types';

interface GtmMetricCardsProps {
  metrics: MetricSummary;
  targetView: TargetView;
  onFilterByStatus: (status: string) => void;
}

interface MetricExplainer {
  title: string;
  whatItIs: string;
  calculation: string;
  dataSource: string;
}

export const GtmMetricCards: React.FC<GtmMetricCardsProps> = ({
  metrics,
  targetView,
  onFilterByStatus
}) => {
  const [activeInfoMetric, setActiveInfoMetric] = useState<MetricExplainer | null>(null);

  const targetViewLabel = 
    targetView === 'supabase' ? 'Supabase' :
    targetView === 'neon' ? 'Neon' :
    targetView === 'planetscale' ? 'PlanetScale' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse';

  const verificationPct = metrics.tracked_startups > 0 
    ? Math.round((metrics.verified_count / metrics.tracked_startups) * 100) 
    : 0;

  const explainers: Record<string, MetricExplainer> = {
    all: {
      title: 'Total Accounts Tracked',
      whatItIs: 'The total volume of early-stage through growth-stage venture-backed startups loaded in your active workspace.',
      calculation: 'Count of all startup entities loaded in the territory minus any transient deletions in your active workspace.',
      dataSource: 'Aggregated from official Y Combinator batch directories (W12–S24), a16z Speedrun cohorts, and Sequoia Arc venture portfolios.'
    },
    champion: {
      title: `${targetViewLabel} Native Champions`,
      whatItIs: `Startups identified as actively building on and operating ${targetViewLabel} as their primary data infrastructure.`,
      calculation: `Calculated by filtering all verified companies where the primary database stack includes "${targetViewLabel}".`,
      dataSource: 'Derived from engineering hiring requirements (Greenhouse, Lever, Ashby), public GitHub schema definitions (schema.prisma), and production JavaScript SDK client bundle inspection.'
    },
    migration: {
      title: 'Displacement Pipeline Valuation (ARR)',
      whatItIs: `The total addressable annual contract value (ARR) represented by companies running on competing or legacy databases (Firebase, DynamoDB, MongoDB, self-hosted MySQL).`,
      calculation: `(Enterprise Targets × Enterprise Deal ARR) + (Growth Targets × Growth Deal ARR). Default assumes $36k/yr for Enterprise and $12k/yr for Growth (customizable in Pipeline Math ⚙️).`,
      dataSource: 'Multiplied against verified accounts identified with competitive displacement opportunities in your active territory.'
    },
    ai_vector: {
      title: 'AI / Vector Search Adoption',
      whatItIs: 'The percentage of tech stacks utilizing dedicated vector embeddings and AI search infrastructure (pgvector, Pinecone, Qdrant, Weaviate, Milvus).',
      calculation: '(Startups with Vector Database / Total Tracked Startups) × 100.',
      dataSource: 'Extracted from embeddings pipeline dependencies in public repositories, production JS client bundles, and AI infrastructure job postings.'
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        
        {/* Card 1: Tracked & Verified */}
        <div 
          onClick={() => onFilterByStatus('all')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Accounts Tracked
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoMetric(explainers.all);
                }}
                className="p-1 rounded text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="How this metric is calculated & sourced"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <Database className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metrics.tracked_startups.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {metrics.verified_count.toLocaleString()} verified ({verificationPct}%)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            YC, a16z Speedrun, Sequoia cohorts
          </p>
        </div>

        {/* Card 2: Native Champions */}
        <div 
          onClick={() => onFilterByStatus('champion')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {targetViewLabel} Champions
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoMetric(explainers.champion);
                }}
                className="p-1 rounded text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="How this metric is calculated & sourced"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metrics.native_champions.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Confirmed Native
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <span>High-affinity expansion targets</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 3: Addressable Migration Pipeline */}
        <div 
          onClick={() => onFilterByStatus('migration')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Displacement Pipeline
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoMetric(explainers.migration);
                }}
                className="p-1 rounded text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="How this metric is calculated & sourced"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metrics.pipeline_identified_usd}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {metrics.migration_pipeline_count.toLocaleString()} Accounts
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <span>Competitive legacy migrations</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 4: AI & Vector Penetration */}
        <div 
          onClick={() => onFilterByStatus('ai_vector')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              AI / Vector Penetration
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoMetric(explainers.ai_vector);
                }}
                className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="How this metric is calculated & sourced"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metrics.ai_vector_penetration_pct}%
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Vector Embeddings
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            pgvector, Pinecone, Qdrant workloads
          </p>
        </div>

      </div>

      {/* Metric Explainer Modal / Popover */}
      {activeInfoMetric && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setActiveInfoMetric(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {activeInfoMetric.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveInfoMetric(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Sections */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                  What this is
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {activeInfoMetric.whatItIs}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                  Calculation Methodology
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                  {activeInfoMetric.calculation}
                </p>
              </div>

              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                  Data Provenance & Sources
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {activeInfoMetric.dataSource}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveInfoMetric(null)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
