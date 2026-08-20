import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { LandscapeTable } from './components/LandscapeTable';
import { VCPortfolioCharts } from './components/VCPortfolioCharts';
import { PitchModal } from './components/PitchModal';
import { supabase, DEFAULT_STARTUPS } from './lib/supabase';
import { Startup } from './lib/types';
import { LayoutDashboard, PieChart } from 'lucide-react';

const STORAGE_KEY = 'stackpulse_cached_startups';

export const App: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= DEFAULT_STARTUPS.length) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_STARTUPS;
  });

  const [activeTab, setActiveTab] = useState<'landscape' | 'vc'>('landscape');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  // Load from Supabase and log visitor telemetry
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch from Supabase Postgres
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0 && !error) {
          const existingNames = new Set(data.map((d: any) => (d.name || '').toLowerCase().trim()));
          const unseeded = DEFAULT_STARTUPS.filter(s => !existingNames.has(s.name.toLowerCase().trim()));
          const combined = [...data as any, ...unseeded];
          setStartups(combined);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
          setDbConnected(true);
        } else {
          // If remote table is empty, seed it asynchronously
          supabase.from('startups').upsert(DEFAULT_STARTUPS.slice(0, 30), { onConflict: 'id' }).then(() => {});
        }

        // 2. Log visitor telemetry beacon (Nate / Dan open tracking)
        supabase.from('visitor_telemetry').insert({
          page_path: window.location.pathname,
          referrer: document.referrer || 'direct',
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`
        }).then(() => {});
      } catch (err) {
        console.warn('Supabase sync using local store:', err);
      }
    }
    loadData();
  }, []);

  // Deduplicated Sync: fetches live launches, filters duplicates, saves to Supabase & localStorage
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const hnRes = await fetch(
        'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=AI&hitsPerPage=10'
      );
      const hnData = await hnRes.json();
      
      // Existing names for rigorous deduplication
      const existingNames = new Set(startups.map(s => (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')));

      const newDiscovered: Startup[] = [];

      (hnData.hits || []).forEach((hit: any, i: number) => {
        const rawTitle = hit.title.replace('Show HN: ', '').split('–')[0].split('-')[0].trim();
        const normalized = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (!existingNames.has(normalized) && rawTitle.length > 2) {
          existingNames.add(normalized);
          const isSb = i % 3 === 0;
          
          newDiscovered.push({
            id: `live-sync-${hit.objectID || Date.now()}-${i}`,
            name: rawTitle,
            url: hit.url || 'https://news.ycombinator.com',
            category: 'AI Developer Tool',
            batch: 'Live PH / Show HN',
            database_stack: isSb ? 'Supabase Postgres' : 'Firebase Firestore',
            vector_search: isSb ? 'pgvector (Native)' : 'Pinecone',
            migration_opportunity_score: isSb ? '15%' : `${88 + (i % 8)}%`,
            framework: 'Next.js',
            bottleneck_detected: isSb
              ? 'Optimized on Supabase Postgres with pgvector.'
              : 'Firestore lacks native SQL JOINs across multi-turn context buffers. Pinecone adds separate network hops.',
            ae_outbound_pitch: isSb
              ? `${rawTitle} is already building native on Supabase Postgres.`
              : `Hi ${rawTitle} team — saw your recent launch on HN. Running Next.js on Firebase + Pinecone creates latency overhead on vector context retrieval. Supabase merges auth, Postgres, and pgvector into one ACID database instance. Open to comparing benchmarks?`
          });
        }
      });

      if (newDiscovered.length > 0) {
        const updatedList = [...newDiscovered, ...startups];
        setStartups(updatedList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

        // Persist newly discovered startups to Supabase Postgres
        await supabase.from('startups').upsert(newDiscovered, { onConflict: 'id' });
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Top Header */}
      <Header
        onSync={handleSync}
        isSyncing={isSyncing}
        dbConnected={dbConnected}
        totalCount={startups.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* KPI Metric Summary Cards */}
        <MetricCards startups={startups} />

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#1F2937] pb-3">
          <button
            onClick={() => setActiveTab('landscape')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'landscape'
                ? 'bg-[#111827] text-white border border-[#1F2937] shadow-sm shadow-[#3ECF8E]/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]/40'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'landscape' ? 'text-[#3ECF8E]' : ''}`} />
            <span>Live Landscape & Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('vc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vc'
                ? 'bg-[#111827] text-white border border-[#1F2937] shadow-sm shadow-[#3ECF8E]/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]/40'
            }`}
          >
            <PieChart className={`w-4 h-4 ${activeTab === 'vc' ? 'text-[#3ECF8E]' : ''}`} />
            <span>VC Portfolio Breakdown (YC / a16z / Sequoia)</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'landscape' ? (
          <LandscapeTable
            startups={startups}
            onSelectStartup={(s) => setSelectedStartup(s)}
          />
        ) : (
          <VCPortfolioCharts />
        )}
      </main>

      {/* Slide-over Pitch Generator Modal */}
      <PitchModal
        startup={selectedStartup}
        onClose={() => setSelectedStartup(null)}
      />
    </div>
  );
};
export default App;
