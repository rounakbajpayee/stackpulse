import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Database, 
  Cpu, 
  Globe, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Check
} from 'lucide-react';
import { Startup, Industry, DatabaseStack, VectorSearch } from '../lib/types';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup: Startup | null;
  onSave: (id: string, updates: Partial<Startup>) => void;
  isAdmin: boolean;
}

const COMMON_DBS: string[] = [
  'PostgreSQL',
  'Supabase Postgres',
  'Firebase Firestore',
  'MongoDB Atlas',
  'MySQL',
  'Redis',
  'ClickHouse',
  'PlanetScale',
  'AWS DynamoDB',
  'AWS Aurora / RDS',
  'SQLite / DuckDB',
  'Neon',
  'Unknown'
];

const COMMON_VECTORS: string[] = [
  'None',
  'pgvector',
  'Pinecone',
  'Qdrant',
  'Weaviate',
  'Milvus'
];

const INDUSTRIES: Industry[] = [
  'B2B SaaS / DevTools',
  'AI / Machine Learning',
  'FinTech / Payments',
  'Healthcare / Bio',
  'E-Commerce / Consumer',
  'Hardware / Industrial',
  'Other'
];

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  onClose,
  startup,
  onSave,
  isAdmin
}) => {
  const [dbStack, setDbStack] = useState('');
  const [vectorSearch, setVectorSearch] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState<Industry>('B2B SaaS / DevTools');
  const [framework, setFramework] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (startup) {
      setDbStack(startup.database_stack || '');
      setVectorSearch(startup.vector_search || 'None');
      setWebsiteUrl(startup.url || startup.website_url || '');
      setIndustry(startup.industry || 'B2B SaaS / DevTools');
      setFramework(startup.framework || 'React / Next.js');
      setIsVerified(startup.verification_status === 'verified' && startup.database_stack !== 'Unknown');
    }
  }, [startup]);

  if (!isOpen || !startup) return null;

  const handleToggleDbSuggestion = (db: string) => {
    if (db === 'Unknown') {
      setDbStack('Unknown');
      setIsVerified(false);
      return;
    }
    const current = dbStack === 'Unknown' ? [] : dbStack.split('+').map(s => s.trim()).filter(Boolean);
    if (current.includes(db)) {
      const filtered = current.filter(s => s !== db);
      setDbStack(filtered.length > 0 ? filtered.join(' + ') : 'Unknown');
      if (filtered.length === 0) setIsVerified(false);
    } else {
      const next = [...current, db];
      setDbStack(next.join(' + '));
      setIsVerified(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDb = dbStack.trim() || 'Unknown';
    const updates: Partial<Startup> = {
      database_stack: cleanDb,
      vector_search: (vectorSearch.trim() || 'None') as VectorSearch,
      url: websiteUrl.trim(),
      website_url: websiteUrl.trim(),
      industry,
      framework: framework.trim(),
      verification_status: isVerified && cleanDb !== 'Unknown' ? 'verified' : 'unverified',
      verification_depth: cleanDb !== 'Unknown' ? 'confirmed' : 'deep_scraped'
    };

    onSave(startup.id, updates);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-100">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-6"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Correct Account Intelligence
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {startup.name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {isAdmin ? '🛡️ Admin Edit: Updates canonical master dataset' : 'Personal territory override'}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Field 1: Database Architecture */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Database Architecture</span>
            </label>
            <input
              type="text"
              value={dbStack}
              onChange={(e) => setDbStack(e.target.value)}
              placeholder="e.g. PostgreSQL + Redis + ClickHouse"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {/* Quick Pick Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_DBS.map(db => {
                const isSelected = dbStack.toLowerCase().includes(db.toLowerCase());
                return (
                  <button
                    key={db}
                    type="button"
                    onClick={() => handleToggleDbSuggestion(db)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {db}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 2: Vector Search Layer */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Vector Search Engine</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {COMMON_VECTORS.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVectorSearch(v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border text-center transition-colors ${
                    vectorSearch === v
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Website URL */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Company Website URL</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://company.com"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Field 4: Industry & Framework Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Industry Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span>Industry</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as Industry)}
                className="w-full px-2.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 dark:[color-scheme:dark] [color-scheme:light]"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Framework */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Framework / Infra
              </label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="e.g. Next.js / Python"
                className="w-full px-2.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Verification Status Toggle */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Mark Verified Status
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsVerified(!isVerified)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                isVerified
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {isVerified ? '✓ Verified' : 'Unverified'}
            </button>
          </div>

          {/* Footer Actions */}
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
                  Saved Changes!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Corrections
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
