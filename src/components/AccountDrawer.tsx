import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Trash2,
  Mail,
  Linkedin,
  Info,
  RotateCw,
  Cpu,
  Layers,
  Shield,
  Key,
  Database,
  Brain,
  Zap,
  BarChart3,
  Server,
  DollarSign
} from 'lucide-react';
import { Startup, TargetView, ApiKeysConfig, FinancialAssumptions } from '../lib/types';
import { TechBadge } from './TechBadge';
import { getGtmClassification, getProvenanceDepth } from '../lib/workspace-store';
import { 
  normalizeFunctionalOntology, 
  calculateCompanyArr, 
  getCompanyArrBreakdown,
  synthesizeDeterministicBattlecard, 
  generateAIBattlecardWithLLM,
  DEFAULT_FINANCIAL_ASSUMPTIONS 
} from '../lib/ontology';
import { autoVerifyStartup } from '../lib/supabase';

interface AccountDrawerProps {
  startup: Startup | null;
  onClose: () => void;
  targetView: TargetView;
  apiConfig: ApiKeysConfig;
  financialAssumptions?: FinancialAssumptions;
  onOpenApiKeys: () => void;
  onUpdateStack: (id: string, newStack: string) => void;
  onToggleVerify: (id: string, isVerified: boolean) => void;
  onDeleteAccount: (id: string) => void;
  onEditStartup?: (startup: Startup) => void;
  onStartupAutoVerified?: (updatedStartup: Startup) => void;
  isGuest: boolean;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  startup,
  onClose,
  targetView,
  apiConfig,
  financialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS,
  onOpenApiKeys,
  onUpdateStack,
  onToggleVerify,
  onDeleteAccount,
  onEditStartup,
  onStartupAutoVerified,
  isGuest
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [isGeneratingAiBattlecard, setIsGeneratingAiBattlecard] = useState(false);
  const [aiBattlecardError, setAiBattlecardError] = useState<string | null>(null);
  const [aiBattlecardResult, setAiBattlecardResult] = useState<{
    executiveSummary: string;
    coldOutreachEmail: { subject: string; body: string };
    technicalMigrationPlaybook: string;
    generatedWithModel: string;
  } | null>(null);

  useEffect(() => {
    setAiBattlecardResult(null);
    setAiBattlecardError(null);
  }, [startup?.id]);

  if (!startup) return null;

  const classification = getGtmClassification(startup, targetView);
  const depth = getProvenanceDepth(startup);
  const isVerified = Boolean(startup.database_stack && startup.database_stack !== 'Unknown');
  const ontology = normalizeFunctionalOntology(startup);
  const breakdown = getCompanyArrBreakdown(startup, financialAssumptions, targetView);
  const deterministicBattlecard = synthesizeDeterministicBattlecard(startup, targetView, breakdown.totalArr);
  const hasLlmKey = apiConfig.llmKeys.some(k => k.isActive && k.key.length > 5);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateAiBattlecard = async () => {
    setIsGeneratingAiBattlecard(true);
    setAiBattlecardError(null);
    try {
      const result = await generateAIBattlecardWithLLM(startup, targetView, breakdown.totalArr, apiConfig);
      setAiBattlecardResult(result);
    } catch (err: any) {
      setAiBattlecardError(err.message || 'Failed to generate AI battlecard. Please check your API key.');
    } finally {
      setIsGeneratingAiBattlecard(false);
    }
  };

  const handleAutoVerify = async () => {
    setIsAutoVerifying(true);
    try {
      const result = await autoVerifyStartup(startup, apiConfig);
      if (onStartupAutoVerified) {
        onStartupAutoVerified({
          ...startup,
          database_stack: result.database_stack,
          vector_search: result.vector_search,
          stack_source: result.source,
          verification_depth: result.depth,
          verification_status: result.database_stack !== 'Unknown' ? 'verified' : 'unverified'
        });
      }
    } finally {
      setIsAutoVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200"
      >
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {startup.name}
                </h2>
                <a
                  href={startup.website_url || startup.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {startup.yc_batch || startup.batch || startup.category || 'Portfolio'} · {startup.industry || 'B2B SaaS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Company Intelligence Button */}
            {onEditStartup && (
              <button
                onClick={() => onEditStartup(startup)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs"
                title="Correct database stack, vector engine, or website"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Correct Details</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section 1: 6-Dimension Functional Infrastructure Ontology Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>6D Functional Infrastructure Architecture</span>
              </h3>
              <span className="text-[11px] text-zinc-400">Architectural Ledger</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              {/* 1. Primary Database */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                  <Database className="w-3 h-3 text-emerald-500" />
                  <span>Primary Database</span>
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {ontology.primary_database}
                </div>
              </div>

              {/* 2. Vector Engine */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                  <Brain className="w-3 h-3 text-purple-500" />
                  <span>Vector Engine</span>
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {ontology.vector_engine}
                </div>
              </div>

              {/* 3. Key-Value Cache */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                  <Zap className="w-3 h-3 text-rose-500" />
                  <span>Cache Layer</span>
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {ontology.cache_layer}
                </div>
              </div>

              {/* 4. OLAP & Analytics */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                  <BarChart3 className="w-3 h-3 text-amber-500" />
                  <span>Analytics / OLAP</span>
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {ontology.olap_engine}
                </div>
              </div>

              {/* 5. Identity & Auth */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                  <Key className="w-3 h-3 text-blue-500" />
                  <span>Identity & Auth</span>
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {ontology.auth_provider}
                </div>
              </div>

              {/* 6. Cloud Runtime */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                  <Server className="w-3 h-3 text-indigo-500" />
                  <span>Cloud Runtime</span>
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {ontology.runtime_platform}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Comprehensive Financial Value Metric Breakdown */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Financial Value Metric Valuation
                </h3>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {breakdown.totalArr > 0 ? `$${(breakdown.totalArr / 1000).toFixed(0)}k / yr ARR` : '$0 ARR (Champion)'}
              </span>
            </div>

            {breakdown.totalArr > 0 ? (
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 font-sans border-t border-zinc-200 dark:border-zinc-800 pt-2.5">
                
                {/* 1. Base Compute */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">• Base Compute Tier:</span>
                    <span className="text-[10px] text-zinc-400">{breakdown.vintageLabel}</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    ${(breakdown.computeBase / 1000).toFixed(0)}k / yr
                  </span>
                </div>

                {/* 2. Vector Consolidation */}
                {breakdown.vectorAddon > 0 && (
                  <div className="flex justify-between items-center text-purple-600 dark:text-purple-400 font-medium">
                    <div className="flex flex-col">
                      <span>• Vector Engine Consolidation:</span>
                      <span className="text-[10px] opacity-80">{breakdown.vectorLabel}</span>
                    </div>
                    <span className="font-mono font-bold">+${(breakdown.vectorAddon / 1000).toFixed(0)}k / yr</span>
                  </div>
                )}

                {/* 3. Auth Consolidation */}
                {breakdown.authAddon > 0 && (
                  <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 font-medium">
                    <div className="flex flex-col">
                      <span>• Auth & Identity Consolidation:</span>
                      <span className="text-[10px] opacity-80">{breakdown.authLabel}</span>
                    </div>
                    <span className="font-mono font-bold">+${(breakdown.authAddon / 1000).toFixed(0)}k / yr</span>
                  </div>
                )}

                {/* 4. Cache Consolidation */}
                {breakdown.cacheAddon > 0 && (
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-medium">
                    <div className="flex flex-col">
                      <span>• Key-Value Cache Consolidation:</span>
                      <span className="text-[10px] opacity-80">{breakdown.cacheLabel}</span>
                    </div>
                    <span className="font-mono font-bold">+${(breakdown.cacheAddon / 1000).toFixed(0)}k / yr</span>
                  </div>
                )}

                {/* 5. Compliance Multiplier */}
                {breakdown.complianceMultiplier > 0 && (
                  <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                    <div className="flex flex-col">
                      <span>• Enterprise Compliance & Governance:</span>
                      <span className="text-[10px] opacity-80">{breakdown.complianceLabel}</span>
                    </div>
                    <span className="font-mono font-bold">+${(breakdown.complianceMultiplier / 1000).toFixed(0)}k / yr</span>
                  </div>
                )}

                {/* Summary Row */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                  <span>Total Calculated Opportunity:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    ${(breakdown.totalArr / 1000).toFixed(0)}k / yr
                  </span>
                </div>

              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                This account is already a Native Champion building directly on the target stack. Retained platform ARR.
              </p>
            )}
          </div>

          {/* Section 3: Hybrid Battlecard & Technical Objection Playbook */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Technical Objection & Migration Battlecard</span>
              </h3>

              {/* AI Battlecard Trigger Button */}
              {hasLlmKey ? (
                <button
                  onClick={handleGenerateAiBattlecard}
                  disabled={isGeneratingAiBattlecard}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiBattlecard ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAiBattlecard ? 'Synthesizing...' : '⚡ Generate AI Battlecard'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenApiKeys}
                  className="text-[11px] text-zinc-500 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                  title="Add an AI Inference key in API Keys menu to unlock custom AI battlecards"
                >
                  <span>💡 Enable AI Battlecards</span>
                </button>
              )}
            </div>

            {/* AI Error Warning if failed */}
            {aiBattlecardError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400">
                {aiBattlecardError}
              </div>
            )}

            {/* AI Battlecard Output (if generated) */}
            {aiBattlecardResult ? (
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Executive Strategy ({aiBattlecardResult.generatedWithModel})</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(aiBattlecardResult.coldOutreachEmail.body, 'ai-email')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-500"
                  >
                    {copiedField === 'ai-email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Email</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  {aiBattlecardResult.executiveSummary}
                </p>

                <div className="space-y-1 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Subject: {aiBattlecardResult.coldOutreachEmail.subject}
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed pt-1">
                    {aiBattlecardResult.coldOutreachEmail.body}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Technical Migration Playbook:</div>
                  <div className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line bg-zinc-50 dark:bg-zinc-950/60 p-2.5 rounded-lg font-mono text-[11px]">
                    {aiBattlecardResult.technicalMigrationPlaybook}
                  </div>
                </div>
              </div>
            ) : (
              /* Deterministic 0ms Architecture Battlecard */
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Primary Anticipated Objection:
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium italic">
                    {deterministicBattlecard.primaryObjection}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Architectural Objection Buster:
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {deterministicBattlecard.objectionBuster}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Friction Level: <strong className="text-zinc-900 dark:text-zinc-100">{deterministicBattlecard.frictionLevel}</strong>
                  </span>
                  <button
                    onClick={() => copyToClipboard(deterministicBattlecard.objectionBuster, 'det-buster')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-500"
                  >
                    {copiedField === 'det-buster' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Talking Point</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: On-Demand Verification */}
          {!isVerified && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  Unverified Account
                </h4>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                  {depth === 'deep_scraped' ? 'Exhaustively checked across all free signal tiers.' : 'Pending deep search verification pass.'}
                </p>
              </div>
              <button
                onClick={handleAutoVerify}
                disabled={isAutoVerifying}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoVerifying ? 'animate-spin' : ''}`} />
                <span>{isAutoVerifying ? 'Verifying...' : 'Auto-Verify'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <button
            onClick={() => onDeleteAccount(startup.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
