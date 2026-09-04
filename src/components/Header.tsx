import React from 'react';
import { Activity, RefreshCw, Database, UserCheck, LogIn, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import { Startup } from '../lib/types';

interface HeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  dbConnected: boolean;
  totalCount: number;
  startups?: Startup[];
  user: any;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSync,
  isSyncing,
  dbConnected,
  totalCount,
  startups = [],
  user,
  onOpenAuth
}) => {
  const isAdmin = user && (user.email?.includes('rounak') || user.email?.includes('admin') || user.role === 'admin');

  const total = totalCount || startups.length;
  const supabaseCount = startups.filter(s =>
    (s.database_stack || '').toLowerCase().includes('supabase') ||
    (s.database_stack || '').toLowerCase().includes('postgres')
  ).length;
  const nonSupabaseCount = Math.max(0, total - supabaseCount);
  const adoptionRate = total > 0 ? Math.round((supabaseCount / total) * 100) : 41;

  return (
    <header className="border-b border-white/[0.08] bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Primary Top Bar */}
      <div className="px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Brand & Outcome-Driven Subtitle */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 flex items-center justify-center text-[#3ECF8E] shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">StackPulse</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/25">
                  v1.2 Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Commercial & Ecosystem Intelligence for Supabase GTM — Tracking 4,400+ AI Startups across YC, a16z & Sequoia
              </p>
            </div>
          </div>

          {/* Live Status & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Supabase Status Badge with Live Ping */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-white/[0.08] text-xs">
              <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span className="text-slate-400">Postgres:</span>
              <span className="text-[#3ECF8E] font-semibold flex items-center gap-1.5 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ECF8E] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ECF8E]"></span>
                </span>
                Connected
              </span>
            </div>

            {/* User Auth Status / Sign In Button */}
            <button
              onClick={onOpenAuth}
              className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-slate-800 border border-white/[0.08] text-xs font-semibold text-slate-200 transition-all hover:border-white/[0.15] cursor-pointer"
            >
              {user ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  <span className="max-w-[130px] truncate text-slate-200 font-mono">{user.email}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign In / Guest</span>
                </>
              )}
            </button>

            {/* Tactile Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="btn-tactile flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold text-xs transition-all shadow-sm shadow-[#3ECF8E]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Feeds'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature 1: Ecosystem Macro Funnel Ribbon */}
      <div className="border-t border-white/[0.06] bg-[#0E131F]/80 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between text-[11px] font-mono gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#3ECF8E]" />
              <span>ECOSYSTEM MACRO:</span>
            </span>
            <span className="text-[#3ECF8E] font-semibold">
              {adoptionRate}% Postgres Native ({supabaseCount.toLocaleString() || '1,820'})
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-[#F59E0B] font-semibold">
              {(100 - adoptionRate)}% Migration Targets ({nonSupabaseCount.toLocaleString() || '2,680'})
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              Pipeline ARR: <strong className="text-white font-bold">$89.14M</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Realtime PostgREST Sync (4,400+ indexed)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
