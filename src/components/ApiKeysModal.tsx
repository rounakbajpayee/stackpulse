import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Plus, 
  Trash2, 
  Check, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Globe, 
  Info 
} from 'lucide-react';
import { ApiKeysConfig, ApiKeyItem } from '../lib/types';

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
  const [activeTab, setActiveTab] = useState<'llm' | 'scraper'>('llm');
  const [llmKeys, setLlmKeys] = useState<ApiKeyItem[]>(config.llmKeys || []);
  const [scraperKeys, setScraperKeys] = useState<ApiKeyItem[]>(config.scraperKeys || []);
  const [activeEngine, setActiveEngine] = useState<'groq' | 'openai' | 'anthropic' | 'gemini'>(config.activeEngine || 'groq');
  
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyModel, setNewKeyModel] = useState('');

  if (!isOpen) return null;

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyValue.trim()) return;

    if (isGuest && onTriggerGuestPrompt) {
      onTriggerGuestPrompt('adding custom API keys');
    }

    const newItem: ApiKeyItem = {
      id: `${activeTab}-${Date.now()}`,
      name: newKeyName.trim() || `${activeTab === 'llm' ? 'AI Inference' : 'Proxy Scraper'} Key ${activeTab === 'llm' ? llmKeys.length + 1 : scraperKeys.length + 1}`,
      key: newKeyValue.trim(),
      isActive: activeTab === 'llm' ? llmKeys.length === 0 : scraperKeys.length === 0,
      model: newKeyModel.trim() || (activeTab === 'llm' ? 'openai/gpt-oss-20b' : undefined),
      addedAt: Date.now()
    };

    if (activeTab === 'llm') {
      setLlmKeys(prev => [...prev, newItem]);
    } else {
      setScraperKeys(prev => [...prev, newItem]);
    }

    setNewKeyName('');
    setNewKeyValue('');
    setNewKeyModel('');
  };

  const handleDeleteKey = (id: string, tab: 'llm' | 'scraper') => {
    if (tab === 'llm') {
      setLlmKeys(prev => prev.filter(k => k.id !== id));
    } else {
      setScraperKeys(prev => prev.filter(k => k.id !== id));
    }
  };

  const handleSetActiveKey = (id: string, tab: 'llm' | 'scraper') => {
    if (tab === 'llm') {
      setLlmKeys(prev => prev.map(k => ({ ...k, isActive: k.id === id })));
    } else {
      setScraperKeys(prev => prev.map(k => ({ ...k, isActive: k.id === id })));
    }
  };

  const handleSave = () => {
    onSave({
      activeEngine,
      llmKeys,
      scraperKeys
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>BYOK API Key Management</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Zero-Server Exposure
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure your private AI Inference Engines and Proxy Scraper pools.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (AI Inference vs Proxy Scraper) */}
        <div className="px-6 pt-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4 bg-zinc-50/50 dark:bg-zinc-950/30">
          <button
            onClick={() => setActiveTab('llm')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'llm'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Inference Engine ({llmKeys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'scraper'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Scraping & Proxies ({scraperKeys.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Engine Selector for AI */}
          {activeTab === 'llm' && (
            <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>Active AI Inference Provider</span>
                <span className="text-[10px] text-zinc-400 font-normal">Supports BYOK LLMs</span>
              </label>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {(['groq', 'openai', 'anthropic', 'gemini'] as const).map(eng => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => setActiveEngine(eng)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                      activeEngine === eng
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {eng}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Key Pool List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {activeTab === 'llm' ? 'AI Inference Key Pool' : 'Proxy Scraper Pool'}
            </h3>

            {(activeTab === 'llm' ? llmKeys : scraperKeys).length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-xs text-zinc-400">
                No {activeTab === 'llm' ? 'AI Inference' : 'Scraper'} keys added yet. Add a key below to enable live AI battlecard synthesis and deep proxy scraping.
              </div>
            ) : (
              (activeTab === 'llm' ? llmKeys : scraperKeys).map(k => (
                <div 
                  key={k.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    k.isActive 
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => handleSetActiveKey(k.id, activeTab)}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        k.isActive
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                      }`}
                      title="Set as active key"
                    >
                      {k.isActive && <Check className="w-2.5 h-2.5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="truncate">{k.name}</span>
                        {k.isActive && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 truncate">
                        {visibleKeys[k.id] ? k.key : (k.key ? `••••••••••••${k.key.slice(-4)}` : 'No key provided')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleKeyVisibility(k.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      title={visibleKeys[k.id] ? 'Hide Key' : 'Show Key'}
                    >
                      {visibleKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(k.id, activeTab)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500"
                      title="Delete Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Key Form */}
          <form onSubmit={handleAddKey} className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Add New {activeTab === 'llm' ? 'AI Inference' : 'Proxy Scraper'} Key
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Key Label (e.g. Primary Key)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />

              <input
                type="password"
                placeholder={activeTab === 'llm' ? 'API Key (gsk_... / sk-...)' : 'Scraper API Key (fc-... / ...)'}
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 sm:col-span-2"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newKeyValue.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Key to Pool</span>
              </button>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Keys are stored strictly in client-side localStorage.</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
