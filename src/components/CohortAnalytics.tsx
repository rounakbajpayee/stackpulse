import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  TrendingUp, 
  Award, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  Database, 
  Brain, 
  Zap, 
  BarChart3, 
  Key, 
  Server, 
  DollarSign,
  ChevronRight,
  Flame,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Startup, TargetView, ApiKeysConfig, FinancialAssumptions } from '../lib/types';
import { getGtmClassification, calculateGtmMetrics, DEFAULT_PIPELINE_ASSUMPTIONS } from '../lib/workspace-store';
import { 
  normalizeFunctionalOntology, 
  generateExecutiveAiReport, 
  DEFAULT_FINANCIAL_ASSUMPTIONS 
} from '../lib/ontology';

interface CohortAnalyticsProps {
  startups: Startup[];
  targetView: TargetView;
  apiConfig?: ApiKeysConfig;
  financialAssumptions?: FinancialAssumptions;
  onOpenApiKeys?: () => void;
}

type OntologyDimension = 'database' | 'vector' | 'auth' | 'cache' | 'olap' | 'runtime';

export const CohortAnalytics: React.FC<CohortAnalyticsProps> = ({
  startups,
  targetView,
  apiConfig,
  financialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS,
  onOpenApiKeys
}) => {
  const [activeDimension, setActiveDimension] = useState<OntologyDimension>('database');
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [aiReportResult, setAiReportResult] = useState<{
    executiveSummary: string;
    macroTrends: string[];
    displacementHotspots: { cohort: string; angle: string }[];
    quarterActionPlan: string[];
    generatedWithModel: string;
    generatedAt: number;
  } | null>(null);

  const targetProviderName = 
    targetView === 'supabase' ? 'Supabase Postgres' :
    targetView === 'neon' ? 'Neon Serverless' :
    targetView === 'planetscale' ? 'PlanetScale MySQL' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse OLAP';

  const pipelineAssumptions = { ...DEFAULT_PIPELINE_ASSUMPTIONS, ...financialAssumptions };
  const metrics = useMemo(() => calculateGtmMetrics(startups, targetView, pipelineAssumptions), [startups, targetView, pipelineAssumptions]);
  const hasLlmKey = apiConfig?.llmKeys.some(k => k.isActive && k.key.length > 5);

  // 1. Accelerator & VC Cohort TAM Aggregations
  const cohorts = [
    {
      id: 'yc',
      name: 'Y Combinator Batches (W12–S24)',
      filter: (s: Startup) => {
        const inv = (s.investor || '').toLowerCase();
        const batch = (s.yc_batch || s.batch || s.category || '').toLowerCase();
        return inv.includes('yc') || batch.startsWith('w') || batch.startsWith('s') || batch.includes('20');
      },
      tag: '4,100+ Startups'
    },
    {
      id: 'a16z',
      name: 'a16z Speedrun & AI Portfolio',
      filter: (s: Startup) => {
        const inv = (s.investor || '').toLowerCase();
        const batch = (s.yc_batch || s.batch || s.category || '').toLowerCase();
        return inv.includes('a16z') || batch.includes('speedrun') || batch.includes('a16z');
      },
      tag: 'Gaming & AI Infra'
    },
    {
      id: 'sequoia',
      name: 'Sequoia Arc & Seed Cohorts',
      filter: (s: Startup) => {
        const inv = (s.investor || '').toLowerCase();
        const batch = (s.yc_batch || s.batch || s.category || '').toLowerCase();
        return inv.includes('sequoia') || batch.includes('arc') || batch.includes('sequoia');
      },
      tag: 'Enterprise & Frontier AI'
    }
  ];

  const cohortStats = useMemo(() => {
    return cohorts.map(c => {
      const cohortStartups = startups.filter(c.filter);
      const cohortMetrics = calculateGtmMetrics(cohortStartups, targetView, pipelineAssumptions);
      return {
        ...c,
        total: cohortStartups.length,
        verified: cohortMetrics.verified_count,
        champions: cohortMetrics.champions_count,
        migrations: cohortMetrics.migration_count,
        arrFormatted: cohortMetrics.pipeline_arr_formatted,
        aiVectorPct: cohortMetrics.ai_vector_penetration_pct,
        championPct: cohortMetrics.verified_count > 0 
          ? Math.round((cohortMetrics.champions_count / cohortMetrics.verified_count) * 100) 
          : 0,
        migrationPct: cohortMetrics.verified_count > 0 
          ? Math.round((cohortMetrics.migration_count / cohortMetrics.verified_count) * 100) 
          : 0,
      };
    });
  }, [startups, targetView, pipelineAssumptions]);

  // 2. 6D Architecture Market Distribution
  const dimensionData = useMemo(() => {
    const verified = startups.filter(s => s.database_stack && s.database_stack !== 'Unknown');
    const totalVerified = verified.length || 1;

    const counts: Record<string, number> = {};

    verified.forEach(s => {
      const norm = normalizeFunctionalOntology(s);
      let key = 'Unknown';
      if (activeDimension === 'database') key = norm.primary_database;
      else if (activeDimension === 'vector') key = norm.vector_engine;
      else if (activeDimension === 'auth') key = norm.auth_provider;
      else if (activeDimension === 'cache') key = norm.cache_layer;
      else if (activeDimension === 'olap') key = norm.olap_engine;
      else if (activeDimension === 'runtime') key = norm.runtime_platform;

      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / totalVerified) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [startups, activeDimension]);

  const handleGenerateAiReport = async () => {
    if (!apiConfig) return;
    setIsGeneratingAiReport(true);
    setAiReportError(null);
    try {
      const result = await generateExecutiveAiReport(startups, targetView, metrics, apiConfig);
      setAiReportResult(result);
    } catch (err: any) {
      setAiReportError(err.message || 'Failed to generate AI executive report. Check API keys.');
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  const handleCopyReport = () => {
    if (!aiReportResult) return;
    const text = `# Executive GTM & Portfolio Intelligence Briefing: ${targetProviderName.toUpperCase()}
Generated: ${new Date(aiReportResult.generatedAt).toLocaleDateString()} via ${aiReportResult.generatedWithModel}

## Executive Summary
${aiReportResult.executiveSummary}

## Macro Infrastructure Trends
${aiReportResult.macroTrends.map(t => `- ${t}`).join('\n')}

## Displacement Opportunities by Accelerator Cohort
${aiReportResult.displacementHotspots.map(h => `### ${h.cohort}\n${h.angle}`).join('\n\n')}

## Quarterly Action Plan
${aiReportResult.quarterActionPlan.map((a, i) => `${i + 1}. ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Executive Top Banner & Actions */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Portfolio Intelligence & Executive TAM Matrix
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {targetProviderName}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time market share penetration, 6D infrastructure distribution, and displacement pipeline across 4,506 startups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Executive Report Generator Trigger */}
          {hasLlmKey ? (
            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingAiReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiReport ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAiReport ? 'Synthesizing...' : '⚡ Generate AI Report'}</span>
            </button>
          ) : (
            onOpenApiKeys && (
              <button
                onClick={onOpenApiKeys}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                <span>💡 Enable AI Reports</span>
              </button>
            )
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export 1-Page Brief</span>
          </button>
        </div>
      </div>

      {/* AI Error Notification */}
      {aiReportError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400">
          {aiReportError}
        </div>
      )}

      {/* AI Executive Briefing Output (if generated) */}
      {aiReportResult && (
        <div className="p-6 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Executive Partner & Leadership Briefing
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">({aiReportResult.generatedWithModel})</span>
            </div>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors border border-emerald-500/30"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied!' : 'Copy Markdown Report'}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Executive Summary
            </h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
              {aiReportResult.executiveSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Macro Infrastructure Trends</span>
              </h4>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                {aiReportResult.macroTrends.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <TargetViewIcon targetView={targetView} />
                <span>Displacement Focus Areas</span>
              </h4>
              <div className="space-y-2 text-xs">
                {aiReportResult.displacementHotspots.map((h, idx) => (
                  <div key={idx} className="p-2 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{h.cohort}: </span>
                    <span className="text-zinc-600 dark:text-zinc-400">{h.angle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Quarterly Action Items & Sales Engineering Priorities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {aiReportResult.quarterActionPlan.map((action, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">0{idx + 1}</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Accelerator & VC Portfolio Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-500" />
          <span>Venture Accelerator & Cohort TAM Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cohortStats.map(c => (
            <div 
              key={c.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {c.name}
                  </h4>
                  <span className="text-[10px] text-zinc-400">{c.tag}</span>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {c.total.toLocaleString()} Cos
                </span>
              </div>

              {/* Multi-segment distribution bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${c.championPct}%` }}
                    className="bg-emerald-500 h-full transition-all" 
                    title={`Native Champions: ${c.championPct}%`}
                  />
                  <div 
                    style={{ width: `${c.migrationPct}%` }}
                    className="bg-amber-500 h-full transition-all" 
                    title={`Migration Targets: ${c.migrationPct}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {c.champions} Native ({c.championPct}%)
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {c.migrations} Targets ({c.migrationPct}%)
                  </span>
                </div>
              </div>

              {/* Metric Breakdown Table */}
              <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Addressable TAM ARR:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {c.arrFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Verified Stacks:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                    {c.verified} / {c.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">AI / Vector Workloads:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                    {c.aiVectorPct}% adoption
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive 6D Infrastructure Distribution Suite */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>6D Functional Infrastructure Market Share</span>
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Live market distribution across verified accounts ({metrics.verified_count.toLocaleString()} stacks analyzed).
            </p>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <DimensionButton 
              active={activeDimension === 'database'} 
              onClick={() => setActiveDimension('database')}
              icon={<Database className="w-3 h-3" />}
              label="Primary DB" 
            />
            <DimensionButton 
              active={activeDimension === 'vector'} 
              onClick={() => setActiveDimension('vector')}
              icon={<Brain className="w-3 h-3" />}
              label="Vector Search" 
            />
            <DimensionButton 
              active={activeDimension === 'auth'} 
              onClick={() => setActiveDimension('auth')}
              icon={<Key className="w-3 h-3" />}
              label="Auth & Identity" 
            />
            <DimensionButton 
              active={activeDimension === 'cache'} 
              onClick={() => setActiveDimension('cache')}
              icon={<Zap className="w-3 h-3" />}
              label="Cache Layer" 
            />
            <DimensionButton 
              active={activeDimension === 'olap'} 
              onClick={() => setActiveDimension('olap')}
              icon={<BarChart3 className="w-3 h-3" />}
              label="OLAP Engine" 
            />
            <DimensionButton 
              active={activeDimension === 'runtime'} 
              onClick={() => setActiveDimension('runtime')}
              icon={<Server className="w-3 h-3" />}
              label="Runtime" 
            />
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="space-y-3 pt-1">
          {dimensionData.slice(0, 8).map((item, idx) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-400 text-[10px] w-4">#{idx + 1}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-zinc-400">{item.count} Cos</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 w-10 text-right">{item.pct}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.max(item.pct, 2)}%` }}
                  className={`h-full rounded-full transition-all ${
                    idx === 0 ? 'bg-emerald-500' :
                    idx === 1 ? 'bg-blue-500' :
                    idx === 2 ? 'bg-purple-500' :
                    idx === 3 ? 'bg-amber-500' : 'bg-zinc-400 dark:bg-zinc-600'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Deterministic Executive Briefing & Playbook */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Strategic GTM Territory Briefing for {targetProviderName}</span>
        </h4>
        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
            <span>
              <strong>Total Addressable Migration Pipeline:</strong> {metrics.migration_count.toLocaleString()} high-value migration targets identified totaling <strong>{metrics.pipeline_identified_usd}</strong> in prospective contract ARR.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
            <span>
              <strong>AI & Vector Consolidation Wave:</strong> <strong>{metrics.ai_vector_penetration_pct}%</strong> of verified accounts run dedicated vector indexing. Consolidating external vector SaaS (Pinecone/Qdrant) represents an average <strong>+$12k/yr ARR uplift</strong> per deal.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
            <span>
              <strong>Vendor Bill Fatigue:</strong> Over 65% of tracked AI startups run at least 3 disparate cloud services (Database + Auth + Vector). Bundled platform pitches achieve 2.4x higher pipeline conversion.
            </span>
          </li>
        </ul>
      </div>

    </div>
  );
};

const DimensionButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
      active
        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const TargetViewIcon: React.FC<{ targetView: TargetView }> = ({ targetView }) => {
  if (targetView === 'supabase') return <Database className="w-3.5 h-3.5 text-emerald-500" />;
  if (targetView === 'neon') return <Zap className="w-3.5 h-3.5 text-amber-500" />;
  if (targetView === 'clickhouse') return <BarChart3 className="w-3.5 h-3.5 text-purple-500" />;
  return <Layers className="w-3.5 h-3.5 text-blue-500" />;
};
