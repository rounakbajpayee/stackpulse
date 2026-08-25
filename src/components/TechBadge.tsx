import React from 'react';
import { TargetView } from '../lib/types';

interface TechBadgeProps {
  tech?: string;
  name?: string;
  isVector?: boolean;
  targetView?: TargetView;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ tech, name, isVector }) => {
  const displayVal = tech || name || 'Unknown';
  if (!displayVal || displayVal === 'None' || displayVal === 'Unknown') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
        {displayVal || 'Unknown'}
      </span>
    );
  }

  const t = displayVal.toLowerCase();

  // Color mappings
  let colorClasses = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

  if (t.includes('supabase')) {
    colorClasses = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-semibold';
  } else if (t.includes('postgres')) {
    colorClasses = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 font-medium';
  } else if (t.includes('firebase') || t.includes('firestore')) {
    colorClasses = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  } else if (t.includes('mongo')) {
    colorClasses = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  } else if (t.includes('redis')) {
    colorClasses = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  } else if (t.includes('clickhouse')) {
    colorClasses = 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60';
  } else if (t.includes('dynamodb')) {
    colorClasses = 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60';
  } else if (t.includes('sqlite') || t.includes('duckdb')) {
    colorClasses = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
  } else if (t.includes('mysql')) {
    colorClasses = 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60';
  } else if (isVector) {
    colorClasses = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${colorClasses}`}>
      {displayVal}
    </span>
  );
};
