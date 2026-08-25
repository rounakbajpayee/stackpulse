import React, { useState } from 'react';
import { 
  Database, 
  Sun, 
  Moon, 
  Key, 
  Calculator, 
  Layers, 
  RotateCcw, 
  User as UserIcon, 
  LogOut, 
  Info, 
  X 
} from 'lucide-react';
import { TargetView } from '../lib/types';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  targetView: TargetView;
  onChangeTargetView: (view: TargetView) => void;
  onOpenApiKeys: () => void;
  onOpenPipelineMath: () => void;
  onOpenAuth: () => void;
  onResetWorkspace: () => void;
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
  totalTracked: number;
  verifiedCount: number;
  hasGuestDeltas: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  targetView,
  onChangeTargetView,
  onOpenApiKeys,
  onOpenPipelineMath,
  onOpenAuth,
  onResetWorkspace,
  user,
  isAdmin,
  onSignOut,
  totalTracked,
  verifiedCount,
  hasGuestDeltas
}) => {
  const [showTargetViewInfo, setShowTargetViewInfo] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand & Live Counter */}
        <div className="flex items-center gap-3">
          <a 
            href="/supabase" 
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/supabase';
            }}
            className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity"
            title="StackPulse Home"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                StackPulse
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 hidden sm:inline-block">
                GTM Intel
              </span>
            </div>
          </a>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{totalTracked.toLocaleString()} Accounts</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{verifiedCount.toLocaleString()} Verified Stacks</span>
          </div>
        </div>

        {/* Executive Controls & Actions */}
        <div className="flex items-center gap-2">

          {/* Target View Dropdown with Info Explainer */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-600 dark:text-zinc-400 mr-1 hidden md:inline">Target View:</span>
              <select
                value={targetView}
                onChange={(e) => onChangeTargetView(e.target.value as TargetView)}
                className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer text-xs pr-1 dark:[color-scheme:dark] [color-scheme:light]"
              >
                <option value="supabase" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">Supabase</option>
                <option value="neon" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">Neon</option>
                <option value="planetscale" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">PlanetScale</option>
                <option value="mongodb" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">MongoDB Atlas</option>
                <option value="clickhouse" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">ClickHouse</option>
              </select>
              <button
                onClick={() => setShowTargetViewInfo(true)}
                className="ml-1 text-zinc-400 hover:text-emerald-500"
                title="Explain Target View classification"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pipeline Math Button */}
          <button
            onClick={onOpenPipelineMath}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Configure Pipeline ARR Deal Sizes"
          >
            <Calculator className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden lg:inline">Pipeline Math</span>
          </button>

          {/* API Keys Button */}
          <button
            onClick={onOpenApiKeys}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Configure LLM & Scraper API Key Pools"
          >
            <Key className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden lg:inline">API Keys</span>
          </button>

          {/* Guest Workspace Reset */}
          {hasGuestDeltas && (
            <button
              onClick={onResetWorkspace}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors"
              title="Reset all guest deletions and manual stack overrides to master"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Workspace</span>
            </button>
          )}

          {/* Auth Button & Profile Dropdown */}
          {user ? (
            <div className="flex items-center gap-2 pl-1.5 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hidden md:inline truncate max-w-[110px]">
                  {user.email?.split('@')[0]}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                  isAdmin 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {isAdmin ? 'Admin' : 'Personal'}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-lg transition-colors shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/rounakbajpayee/stackpulse"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
            title="View Source on GitHub (rounakbajpayee/stackpulse)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Theme Toggle (Sun/Moon) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Target View Explainer Popover */}
      {showTargetViewInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setShowTargetViewInfo(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-5 space-y-3 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Target View GTM Lens
                </h3>
              </div>
              <button
                onClick={() => setShowTargetViewInfo(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Switching the <strong>Target View</strong> instantly re-evaluates all 4,504 accounts from that provider's competitive perspective:
            </p>

            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 font-sans pl-1">
              <li>• <strong>Champions (Emerald):</strong> Startups building natively on this provider's stack.</li>
              <li>• <strong>Migration Targets (Amber):</strong> Startups using legacy/competing databases that represent high displacement revenue.</li>
              <li>• <strong>Pipeline ARR:</strong> Recalculates the displacement contract value using deal sizes set in Pipeline Math ⚙️.</li>
            </ul>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowTargetViewInfo(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
