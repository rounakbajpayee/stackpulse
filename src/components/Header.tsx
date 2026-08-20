import React from 'react';
import { Activity, RefreshCw, Database, Radio } from 'lucide-react';

interface HeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  dbConnected: boolean;
  totalCount: number;
  autoSync: boolean;
  onToggleAutoSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSync,
  isSyncing,
  dbConnected,
  totalCount,
  autoSync,
  onToggleAutoSync
}) => {
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
        <div className="flex items-center gap-3 flex-wrap">
          {/* Supabase Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs">
            <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span className="text-slate-300 font-medium">Backend:</span>
            <span className="text-[#3ECF8E] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse"></span>
              Supabase Postgres
            </span>
          </div>

          {/* Auto-Sync Toggle */}
          <button
            onClick={onToggleAutoSync}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoSync
                ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]'
                : 'bg-[#111827] border-[#1F2937] text-slate-400 hover:text-slate-200'
            }`}
            title="Automatically poll live launch APIs every 60 seconds"
          >
            <Radio className={`w-3.5 h-3.5 ${autoSync ? 'animate-pulse text-[#3ECF8E]' : ''}`} />
            <span>Auto-Pulse (60s): {autoSync ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sync Trigger Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-semibold text-xs transition-all shadow-sm shadow-[#3ECF8E]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Crawling Feeds...' : 'Sync Live Batches (100+)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
