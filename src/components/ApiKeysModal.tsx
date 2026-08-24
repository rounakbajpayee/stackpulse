import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Info, 
  Globe, 
  Cpu, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { ApiKeysConfig, ApiKeyItem } from '../lib/types';
import { DEFAULT_API_KEYS } from '../lib/workspace-store';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeysConfig;
  onSave: (config: ApiKeysConfig) => void;
  isGuest: boolean;
  onTriggerGuestPrompt?: (action: string) => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  isGuest,
  onTriggerGuestPrompt
}) => {
  const [llmKeys, setLlmKeys] = useState<ApiKeyItem[]>(config.llmKeys || []);
  const [scraperKeys, setScraperKeys] = useState<ApiKeyItem[]>(config.scraperKeys || []);
  const [activeLlmProvider, setActiveLlmProvider] = useState(config.activeLlmProvider || 'groq');
  const [customPrompt, setCustomPrompt] = useState(config.customPrompt || DEFAULT_API_KEYS.customPrompt);
  
  // New Key Inputs
  const [newLlmProvider, setNewLlmProvider] = useState<'groq' | 'openai' | 'anthropic' | 'gemini'>('groq');
  const [newLlmKey, setNewLlmKey] = useState('');
  const [newLlmLabel, setNewLlmLabel] = useState('');
  
  const [newScraperProvider, setNewScraperProvider] = useState<'scraperapi' | 'firecrawl'>('scraperapi');
  const [newScraperKey, setNewScraperKey] = useState('');
  const [newScraperLabel, setNewScraperLabel] = useState('');
  
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [activeInfoTopic, setActiveInfoTopic] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleShowKey = (id: string) => {
    setShowKeyMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddLlmKey = () => {
    if (!newLlmKey.trim()) return;
    const newKey: ApiKeyItem = {
      id: `llm-${Date.now()}`,
      provider: newLlmProvider,
      key: newLlmKey.trim(),
      label: newLlmLabel.trim() || `${newLlmProvider.toUpperCase()} Key`,
      category: 'llm',
      isActive: true,
      status: 'active'
    };
    setLlmKeys(prev => [...prev, newKey]);
    setNewLlmKey('');
    setNewLlmLabel('');
    if (isGuest) onTriggerGuestPrompt?.('API key settings');
  };

  const handleRemoveLlmKey = (id: string) => {
    setLlmKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleAddScraperKey = () => {
    if (!newScraperKey.trim()) return;
    const newKey: ApiKeyItem = {
      id: `scraper-${Date.now()}`,
      provider: newScraperProvider,
      key: newScraperKey.trim(),
      label: newScraperLabel.trim() || `${newScraperProvider.toUpperCase()} Pool`,
      category: 'scraper',
      isActive: true,
      status: 'active'
    };
    setScraperKeys(prev => [...prev, newKey]);
    setNewScraperKey('');
    setNewScraperLabel('');
    if (isGuest) onTriggerGuestPrompt?.('Scraper API key pool');
  };

  const handleRemoveScraperKey = (id: string) => {
    setScraperKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: ApiKeysConfig = {
      llmKeys,
      scraperKeys,
      activeLlmProvider,
      customPrompt,
      apiKey: llmKeys.find(k => k.isActive)?.key || '',
      provider: activeLlmProvider
    };
    onSave(updatedConfig);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                API Key Pools & Custom Prompts
              </h3>
              <p className="text-[11px] text-zinc-500">
                Manage your LLM inference and web scraping keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Security & Client-Side Notice */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Zero-Exposure Client Storage:</strong> Keys are stored in your browser's <code className="text-emerald-500 font-mono text-[11px]">localStorage</code>. They are never sent to third parties or logged on central servers.
            </div>
          </div>

          {/* Section 1: LLM Inference Keys */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  1. LLM Extraction & Outbound AI
                </span>
                <button
                  type="button"
                  onClick={() => setActiveInfoTopic(activeInfoTopic === 'llm' ? null : 'llm')}
                  className="text-zinc-400 hover:text-emerald-500"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {llmKeys.length} active key(s)
              </span>
            </div>

            {activeInfoTopic === 'llm' && (
              <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed animate-in fade-in duration-150">
                LLM keys power on-demand tech stack extraction and generative outbound sales pitches (Technical Emails & LinkedIn DMs). Supports Groq, OpenAI (GPT-4o), Anthropic (Claude 3.5), and Google Gemini.
              </div>
            )}

            {/* List of Existing LLM Keys */}
            <div className="space-y-2">
              {llmKeys.map((k) => (
                <div 
                  key={k.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono">
                      {k.provider}
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {k.label}
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {showKeyMap[k.id] ? k.key : `••••••••${k.key.slice(-4)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleShowKey(k.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded"
                    >
                      {showKeyMap[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLlmKey(k.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New LLM Key Form */}
            <div className="p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2 bg-zinc-50/50 dark:bg-zinc-950/50">
              <span className="text-[11px] font-medium text-zinc-500 block">Add LLM Key</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newLlmProvider}
                  onChange={(e) => setNewLlmProvider(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 dark:[color-scheme:dark] [color-scheme:light]"
                >
                  <option value="groq" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Groq</option>
                  <option value="openai" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">OpenAI</option>
                  <option value="anthropic" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Anthropic</option>
                  <option value="gemini" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Gemini</option>
                </select>
                <input
                  type="text"
                  value={newLlmLabel}
                  onChange={(e) => setNewLlmLabel(e.target.value)}
                  placeholder="Key Label (e.g. My Groq Pro)"
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={newLlmKey}
                    onChange={(e) => setNewLlmKey(e.target.value)}
                    placeholder="Key Value (gsk_... / sk-...)"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddLlmKey}
                    className="px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Scraper & Proxy Keys */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  2. Web Scraper & Proxy Pool
                </span>
                <button
                  type="button"
                  onClick={() => setActiveInfoTopic(activeInfoTopic === 'scraper' ? null : 'scraper')}
                  className="text-zinc-400 hover:text-emerald-500"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {scraperKeys.length} key(s) in rotation
              </span>
            </div>

            {activeInfoTopic === 'scraper' && (
              <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed animate-in fade-in duration-150">
                ScraperAPI keys are used to perform deep search extraction when free GitHub and ATS signal tiers return inconclusive. Multiple keys are rotated in round-robin; if one depletes, the runner seamlessly fails over to the next.
              </div>
            )}

            {/* List of Existing Scraper Keys */}
            <div className="space-y-2">
              {scraperKeys.map((k) => (
                <div 
                  key={k.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                      {k.provider}
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {k.label}
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {showKeyMap[k.id] ? k.key : `••••••••${k.key.slice(-4)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleShowKey(k.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded"
                    >
                      {showKeyMap[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveScraperKey(k.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Scraper Key Form */}
            <div className="p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2 bg-zinc-50/50 dark:bg-zinc-950/50">
              <span className="text-[11px] font-medium text-zinc-500 block">Add Scraper Key</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newScraperProvider}
                  onChange={(e) => setNewScraperProvider(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 dark:[color-scheme:dark] [color-scheme:light]"
                >
                  <option value="scraperapi" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">ScraperAPI</option>
                  <option value="firecrawl" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Firecrawl</option>
                </select>
                <input
                  type="text"
                  value={newScraperLabel}
                  onChange={(e) => setNewScraperLabel(e.target.value)}
                  placeholder="Label (e.g. ScraperAPI #1)"
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={newScraperKey}
                    onChange={(e) => setNewScraperKey(e.target.value)}
                    placeholder="API Key..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddScraperKey}
                    className="px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Prompt Editor */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Outbound Prompt Template
              </label>
              <button
                type="button"
                onClick={() => setCustomPrompt(DEFAULT_API_KEYS.customPrompt)}
                className="text-[11px] text-zinc-500 hover:text-emerald-500 transition-colors"
              >
                Reset Default
              </button>
            </div>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-zinc-500">
              Variables: <code className="text-zinc-600 dark:text-zinc-400">{'{{COMPANY_NAME}}'}</code>, <code className="text-zinc-600 dark:text-zinc-400">{'{{CURRENT_DB}}'}</code>, <code className="text-zinc-600 dark:text-zinc-400">{'{{VECTOR_ENGINE}}'}</code>, <code className="text-zinc-600 dark:text-zinc-400">{'{{TARGET_PROVIDER}}'}</code>
            </p>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved Settings!
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Key Pools
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
