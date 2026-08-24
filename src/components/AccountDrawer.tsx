import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Save, 
  Trash2,
  Mail,
  Linkedin,
  Info,
  RotateCw
} from 'lucide-react';
import { Startup, TargetView, ApiKeysConfig } from '../lib/types';
import { TechBadge } from './TechBadge';
import { getGtmClassification, getProvenanceDepth } from '../lib/workspace-store';
import { generateHeuristicPitches, generateCustomLlmPitch } from '../lib/outbound-generator';
import { autoVerifyStartup } from '../lib/supabase';

interface AccountDrawerProps {
  startup: Startup | null;
  onClose: () => void;
  targetView: TargetView;
  apiConfig: ApiKeysConfig;
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
  onOpenApiKeys,
  onUpdateStack,
  onToggleVerify,
  onDeleteAccount,
  onEditStartup,
  onStartupAutoVerified,
  isGuest
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin'>('email');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditingStack, setIsEditingStack] = useState(false);
  const [editedStackValue, setEditedStackValue] = useState('');
  const [isGeneratingLlm, setIsGeneratingLlm] = useState(false);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [activeInfoTopic, setActiveInfoTopic] = useState<string | null>(null);
  
  const [pitchData, setPitchData] = useState({
    emailSubject: '',
    emailBody: '',
    linkedInPitch: ''
  });

  useEffect(() => {
    if (startup) {
      setEditedStackValue(startup.database_stack || '');
      setIsEditingStack(false);
      
      const defaultPitches = generateHeuristicPitches(startup, targetView);
      setPitchData(defaultPitches);
    }
  }, [startup, targetView]);

  if (!startup) return null;

  const gtm = getGtmClassification(startup, targetView);
  const depth = getProvenanceDepth(startup);
  const isVerified = startup.verification_status === 'verified' && startup.database_stack !== 'Unknown';

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleSaveStack = () => {
    onUpdateStack(startup.id, editedStackValue);
    setIsEditingStack(false);
  };

  const handleAutoVerify = async () => {
    setIsAutoVerifying(true);
    try {
      const result = await autoVerifyStartup(startup, apiConfig);
      const updated: Startup = {
        ...startup,
        database_stack: result.database_stack,
        vector_search: result.vector_search,
        stack_source: result.source,
        verification_depth: result.depth,
        verification_status: result.database_stack !== 'Unknown' ? 'verified' : 'unverified'
      };
      onStartupAutoVerified?.(updated);
      onUpdateStack(startup.id, result.database_stack);
    } finally {
      setIsAutoVerifying(false);
    }
  };

  const handleGenerateCustomAi = async () => {
    const hasKey = apiConfig.llmKeys?.some(k => k.isActive && k.key) || apiConfig.apiKey;
    if (!hasKey) {
      onOpenApiKeys();
      return;
    }

    setIsGeneratingLlm(true);
    try {
      const generated = await generateCustomLlmPitch(startup, targetView, apiConfig);
      setPitchData(generated);
    } finally {
      setIsGeneratingLlm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {startup.name}
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {startup.yc_batch || startup.batch || startup.category || 'YC'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                  <span>{startup.industry}</span>
                  {startup.url && (
                    <>
                      <span>·</span>
                      <a
                        href={startup.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Comprehensive Correct Details Button */}
              {onEditStartup && (
                <button
                  onClick={() => onEditStartup(startup)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
                  title="Correct Database, Vector Engine, Website or Industry"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Correct Details</span>
                </button>
              )}

              <button
                onClick={() => onDeleteAccount(startup.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete from workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 flex-1">
            
            {/* Scan Depth Journey Stepper */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Verification Provenance
                  </span>
                  <button
                    onClick={() => setActiveInfoTopic(activeInfoTopic === 'provenance' ? null : 'provenance')}
                    className="text-zinc-400 hover:text-emerald-500"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  depth === 'confirmed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : depth === 'deep_scraped'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}>
                  {depth === 'confirmed' ? 'Confirmed Stack' : depth === 'deep_scraped' ? 'Exhaustive Scan (Truly Unknown)' : 'Surface Scanned (Pending Scraper)'}
                </span>
              </div>

              {activeInfoTopic === 'provenance' && (
                <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed animate-in fade-in duration-150">
                  StackPulse runs a 6-tier pipeline: DNS Resolution $\rightarrow$ GitHub Monorepo configs $\rightarrow$ ATS Jobs (Ashby/Greenhouse) $\rightarrow$ Client JS Bundles $\rightarrow$ Deep Search Proxy. Surface-scanned accounts have completed all free checks and can be enriched with 1-click.
                </div>
              )}

              {/* Visual Pipeline Steps */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono text-center">
                <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ DNS Alive
                </div>
                <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ GitHub
                </div>
                <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ ATS Jobs
                </div>
                <div className={`p-1.5 rounded border font-semibold ${
                  depth === 'deep_scraped' || depth === 'confirmed'
                    ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                }`}>
                  {depth === 'deep_scraped' || depth === 'confirmed' ? '✓ Scraper' : '⏸️ Scraper Skipped'}
                </div>
              </div>

              {/* 1-Click Auto-Verify Trigger */}
              {depth === 'surface_free' && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    Run missing deep scrape step:
                  </span>
                  <button
                    onClick={handleAutoVerify}
                    disabled={isAutoVerifying}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <RotateCw className={`w-3 h-3 ${isAutoVerifying ? 'animate-spin' : ''}`} />
                    <span>{isAutoVerifying ? 'Verifying...' : 'Auto-Verify Now'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Architecture Overview & Manual Override */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Verified Stack
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleVerify(startup.id, !isVerified)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                      isVerified
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isVerified ? 'Verified' : 'Mark Verified'}</span>
                  </button>
                </div>
              </div>

              {/* Stack Details & Inline Editor */}
              {isEditingStack ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedStackValue}
                    onChange={(e) => setEditedStackValue(e.target.value)}
                    placeholder="e.g. PostgreSQL + MongoDB Atlas + Redis"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setIsEditingStack(false)}
                      className="px-2.5 py-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveStack}
                      className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                    >
                      <Save className="w-3 h-3" />
                      Save Stack
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {startup.database_stack === 'Unknown' ? (
                      <span className="text-xs text-zinc-400 italic">No public database detected</span>
                    ) : (
                      startup.database_stack.split('+').map((d, i) => (
                        <TechBadge key={i} tech={d.trim()} />
                      ))
                    )}
                    {startup.vector_search && startup.vector_search !== 'None' && (
                      <TechBadge tech={startup.vector_search} isVector />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (onEditStartup) onEditStartup(startup);
                      else setIsEditingStack(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    title="Edit database stack and vector layer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Source: {startup.stack_source || 'unknown'}</span>
                <span>Verified: {startup.stack_verified_at ? new Date(startup.stack_verified_at).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>

            {/* GTM Competitive Battlecard */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Target Lens: {targetView.toUpperCase()}</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  gtm.status === 'champion'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                }`}>
                  {gtm.label} ({gtm.score}/100)
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-zinc-500 block mb-0.5">
                  Technical Bottleneck Identified:
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  {gtm.bottleneck}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-medium text-zinc-500 block mb-0.5">
                  Strategic Value Proposition:
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed font-sans">
                  {gtm.pitchAngle}
                </p>
              </div>
            </div>

            {/* Outbound Pitch Generator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === 'email'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Technical Email</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('linkedin')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === 'linkedin'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn Note</span>
                  </button>
                </div>

                <button
                  onClick={handleGenerateCustomAi}
                  disabled={isGeneratingLlm}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingLlm ? 'Generating...' : 'Custom AI ⚙️'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 relative group">
                <button
                  onClick={() => handleCopy(
                    activeTab === 'email' ? `${pitchData.emailSubject}\n\n${pitchData.emailBody}` : pitchData.linkedInPitch,
                    'pitch'
                  )}
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copiedField === 'pitch' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {activeTab === 'email' ? (
                  <div className="space-y-2 pr-14">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Subject:</span>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                        {pitchData.emailSubject}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">Body:</span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed">
                        {pitchData.emailBody}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pr-14">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1">LinkedIn Connection Note:</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                      {pitchData.linkedInPitch}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>
                  {apiConfig.llmKeys?.some(k => k.isActive) ? (
                    <span className="text-emerald-600 dark:text-emerald-400">⚡ LLM Key Active</span>
                  ) : (
                    <span>💡 Using Built-in Heuristic Generator</span>
                  )}
                </span>
                <button
                  onClick={onOpenApiKeys}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Configure API Keys
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
