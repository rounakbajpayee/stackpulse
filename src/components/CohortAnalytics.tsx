import React from 'react';
import { Printer, TrendingUp, Award, Layers, ShieldCheck } from 'lucide-react';
import { Startup, TargetView } from '../lib/types';
import { getGtmClassification } from '../lib/workspace-store';

interface CohortAnalyticsProps {
  startups: Startup[];
  targetView: TargetView;
}

export const CohortAnalytics: React.FC<CohortAnalyticsProps> = ({
  startups,
  targetView,
}) => {
  const targetProviderName = 
    targetView === 'supabase' ? 'Supabase' :
    targetView === 'neon' ? 'Neon' :
    targetView === 'planetscale' ? 'PlanetScale' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse';

  // Compute breakdown by cohort
  const cohorts = [
    { id: 'yc', name: 'Y Combinator Batches' },
    { id: 'a16z', name: 'a16z Speedrun' },
    { id: 'sequoia', name: 'Sequoia Arc' },
  ];

  const stats = cohorts.map(c => {
    const cos = startups.filter(s => (s.investor || '').toLowerCase().includes(c.id));
    const verified = cos.filter(s => s.database_stack && s.database_stack !== 'Unknown');
    const champions = cos.filter(s => getGtmClassification(s, targetView).isChampion);
    const migrations = cos.filter(s => getGtmClassification(s, targetView).isTarget);
    const aiVectors = cos.filter(s => s.vector_search && s.vector_search !== 'None');

    return {
      ...c,
      total: cos.length,
      verifiedCount: verified.length,
      championsCount: champions.length,
      migrationsCount: migrations.length,
      aiVectorsCount: aiVectors.length,
      championPct: verified.length > 0 ? Math.round((champions.length / verified.length) * 100) : 0,
      migrationPct: verified.length > 0 ? Math.round((migrations.length / verified.length) * 100) : 0
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Action */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>VC Portfolio & Territory Intelligence Report</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Comparative market share analysis and displacement pipeline across tier-1 venture portfolios.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export 1-Page Partner Brief</span>
        </button>
      </div>

      {/* Cohort Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(c => (
          <div 
            key={c.id}
            className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {c.name}
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {c.total.toLocaleString()} Startups
              </span>
            </div>

            {/* Visual Distribution Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${c.championPct}%` }}
                  className="bg-emerald-500 h-full" 
                  title={`Native Champions: ${c.championPct}%`}
                />
                <div 
                  style={{ width: `${c.migrationPct}%` }}
                  className="bg-amber-500 h-full" 
                  title={`Migration Targets: ${c.migrationPct}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {c.championsCount} Native ({c.championPct}%)
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {c.migrationsCount} Migrations ({c.migrationPct}%)
                </span>
              </div>
            </div>

            {/* Key Metrics List */}
            <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Verified Coverage:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                  {c.verifiedCount} / {c.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">AI / Vector Workloads:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                  {c.aiVectorsCount} Accounts
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Strategic Takeaways for Supabase GTM */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Strategic GTM Territory Takeaways</span>
        </h4>
        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></span>
            <span>
              <strong>YC Cohorts (W20–S24):</strong> Show significant adoption of PostgreSQL + Redis architectures. Prime candidates for pgvector consolidation and connection pooling add-ons.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></span>
            <span>
              <strong>a16z Speedrun Portfolio:</strong> Heavy AI application velocity with DynamoDB and Firebase legacy footprints; ideal ICP for relational + vector migration playbooks.
            </span>
          </li>
        </ul>
      </div>

    </div>
  );
};
