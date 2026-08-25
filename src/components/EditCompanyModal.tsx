import React, { useState, useEffect } from 'react';
import { X, Database, Brain, Globe, Check, Layers, AlertCircle, Zap, BarChart3, Key, Server, DollarSign } from 'lucide-react';
import { Startup } from '../lib/types';
import { normalizeFunctionalOntology } from '../lib/ontology';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup: Startup | null;
  onSave: (id: string, updates: Partial<Startup>) => Promise<void>;
  isAdmin?: boolean;
}

const COMMON_DBS = [
  'PostgreSQL',
  'Supabase Postgres',
  'Firebase Firestore',
  'MongoDB Atlas',
  'PlanetScale',
  'AWS DynamoDB',
  'AWS Aurora / RDS',
  'MySQL',
  'ClickHouse',
  'SQLite / DuckDB',
  'Unknown'
];

const COMMON_VECTORS = ['pgvector (Native)', 'Pinecone', 'Qdrant', 'Weaviate', 'Milvus', 'Chroma', 'None'];
const COMMON_CACHES = ['Redis', 'Upstash', 'AWS ElastiCache', 'Momento', 'None'];
const COMMON_OLAPS = ['ClickHouse', 'Snowflake', 'BigQuery', 'OpenSearch / Elasticsearch', 'Tinybird', 'None'];
const COMMON_AUTHS = ['Clerk', 'Auth0', 'Supabase Auth', 'Firebase Auth', 'NextAuth', 'None'];
const COMMON_RUNTIMES = ['Vercel', 'Cloudflare Workers', 'AWS Lambda / ECS', 'GCP Cloud Run', 'Fly.io', 'Vercel + Cloud'];

const INDUSTRIES = [
  'B2B SaaS / DevTools',
  'AI / Machine Learning',
  'FinTech / Payments',
  'Healthcare / Bio',
  'E-Commerce / Consumer',
  'Hardware / Industrial',
  'Security & Compliance',
  'Other'
];

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  onClose,
  startup,
  onSave,
  isAdmin = false
}) => {
  const [primaryDb, setPrimaryDb] = useState('Unknown');
  const [vectorEngine, setVectorEngine] = useState('None');
  const [cacheLayer, setCacheLayer] = useState('None');
  const [olapEngine, setOlapEngine] = useState('None');
  const [authProvider, setAuthProvider] = useState('None');
  const [runtimePlatform, setRuntimePlatform] = useState('None');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [customArr, setCustomArr] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (startup) {
      const norm = normalizeFunctionalOntology(startup);
      setPrimaryDb(norm.primary_database);
      setVectorEngine(norm.vector_engine);
      setCacheLayer(norm.cache_layer);
      setOlapEngine(norm.olap_engine);
      setAuthProvider(norm.auth_provider);
      setRuntimePlatform(norm.runtime_platform);
      setWebsiteUrl(startup.website_url || startup.url || '');
      setIndustry(startup.industry || 'B2B SaaS / DevTools');
      setCustomArr(typeof startup.custom_arr_override === 'number' ? String(startup.custom_arr_override) : '');
    }
  }, [startup]);

  if (!isOpen || !startup) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const detected: string[] = [];
      if (primaryDb !== 'Unknown') detected.push(primaryDb);
      if (vectorEngine !== 'None') detected.push(vectorEngine);
      if (cacheLayer !== 'None') detected.push(cacheLayer);
      if (olapEngine !== 'None') detected.push(olapEngine);
      if (authProvider !== 'None') detected.push(authProvider);

      const database_stack = detected.length > 0 ? detected.join(' + ') : 'Unknown';
      const parsedArr = customArr.trim() === '' ? null : Number(customArr);

      await onSave(startup.id, {
        primary_database: primaryDb,
        vector_engine: vectorEngine,
        cache_layer: cacheLayer,
        olap_engine: olapEngine,
        auth_provider: authProvider,
        runtime_platform: runtimePlatform,
        database_stack,
        vector_search: vectorEngine,
        website_url: websiteUrl,
        url: websiteUrl,
        industry,
        custom_arr_override: parsedArr,
        verification_status: primaryDb !== 'Unknown' ? 'verified' : 'unverified',
        verification_depth: primaryDb !== 'Unknown' ? 'confirmed' : 'deep_scraped'
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Correct 6D Architecture · {startup.name}</span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Master DB Admin Write
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Adjust functional infrastructure slots, website domain, and custom ARR valuation.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* 6D Functional Slots Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Functional Infrastructure Slots</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Primary Database */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Primary Database</span>
                </label>
                <select
                  value={primaryDb}
                  onChange={(e) => setPrimaryDb(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {COMMON_DBS.map(db => (
                    <option key={db} value={db}>{db}</option>
                  ))}
                </select>
              </div>

              {/* Vector Engine */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                  <span>Vector & Embeddings</span>
                </label>
                <select
                  value={vectorEngine}
                  onChange={(e) => setVectorEngine(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                >
                  {COMMON_VECTORS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Cache Layer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-500" />
                  <span>Key-Value Cache</span>
                </label>
                <select
                  value={cacheLayer}
                  onChange={(e) => setCacheLayer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                >
                  {COMMON_CACHES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* OLAP / Analytics */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Analytics / OLAP</span>
                </label>
                <select
                  value={olapEngine}
                  onChange={(e) => setOlapEngine(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {COMMON_OLAPS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Auth Provider */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  <span>Auth & Identity</span>
                </label>
                <select
                  value={authProvider}
                  onChange={(e) => setAuthProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {COMMON_AUTHS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Cloud Runtime */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Cloud Runtime</span>
                </label>
                <select
                  value={runtimePlatform}
                  onChange={(e) => setRuntimePlatform(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  {COMMON_RUNTIMES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Metadata & Custom ARR Override */}
          <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>Metadata & Custom ARR Override</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Website URL */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://company.ai"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Custom ARR Override */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Custom ARR ($/yr)</label>
                <input
                  type="number"
                  value={customArr}
                  onChange={(e) => setCustomArr(e.target.value)}
                  placeholder="e.g. 48000"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Industry / Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              {isAdmin ? '🛡️ Admin: Commits to Master DB' : 'Persists into personal workspace delta'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Corrections'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
