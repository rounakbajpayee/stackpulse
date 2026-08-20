import React from 'react';
import { Activity, RefreshCw, Database, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  dbConnected: boolean;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onSync, isSyncing, dbConnected, totalCount }) => {
  return (
    <header className="border-b border-[#1F2937] bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3ECF8E]/20 to-[#3ECF8E]/5 border border-[#3ECF8E]/30 flex items-center justify-center glow-supabase">
            <Activity className="w-5 h-5 text-[#3ECF8E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">StackPulse</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/20">
                v1.0 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">Commercial & Ecosystem Intelligence for Cloud Infrastructure</p>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs">
            <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span className="text-slate-300 font-medium">Backend:</span>
            <span className="text-[#3ECF8E] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse"></span>
              Supabase Postgres
            </span>
          </div>

          {/* Sync Trigger Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-semibold text-xs transition-all shadow-sm shadow-[#3ECF8E]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Crawling Feeds...' : 'Sync New Batch (YC/PH)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
