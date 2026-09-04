import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, ShieldAlert, Cpu, Mail, MessageSquare } from 'lucide-react';
import { Startup } from '../lib/types';

interface PitchModalProps {
  startup: Startup | null;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ startup, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<'email' | 'linkedin'>('email');
  const [editedText, setEditedText] = useState('');

  // Dynamically generate PAS Email and LinkedIn pitches
  const generateEmailPitch = (s: Startup) => {
    const isSb = (s.database_stack || '').toLowerCase().includes('supabase');
    if (isSb) {
      return `Subject: Congrats on ${s.name} launch + Supabase architecture check\n\nHi ${s.name} team — saw your recent launch in ${s.category}. Glad to see you are building native on Supabase Postgres with pgvector.\n\nAre you looking to scale dedicated compute instances or enable multi-region read replicas this quarter?\n\nBest,\nSupabase AE Team`;
    }
    return `Subject: Consolidating ${s.name}'s ${s.database_stack} + ${s.vector_search} stack onto native Postgres\n\nHi ${s.name} team — saw your recent launch in ${s.category}. Tracking your progress as one of the sharpest AI teams in ${s.batch || 'recent cohorts'}.\n\nQuick architectural observation: we noticed you're pairing ${s.database_stack} with ${s.vector_search} for vector embeddings. At scale, splitting vector queries across an external relay adds 30–50ms latency on every completion cycle, plus dual-vendor billing sprawl.\n\nConsolidating your primary database and vector memory onto Supabase Postgres (with native pgvector SQL joins) eliminates that network hop and reduces data layer TCO by an estimated 32%.\n\nOpen to a quick 10-minute architecture review this week?`;
  };

  const generateLinkedInPitch = (s: Startup) => {
    const isSb = (s.database_stack || '').toLowerCase().includes('supabase');
    if (isSb) {
      return `Hey ${s.name} team — congrats on the recent launch! Saw you're building ${s.category} on Supabase. Let me know if you need any enterprise compute credits or pgvector optimization support!`;
    }
    return `Hey ${s.name} team — congrats on the ${s.category} launch! Saw you're running ${s.database_stack} + ${s.vector_search}.\n\nWe recently helped several AI founders eliminate 30–50ms vector latency hops and cut dual-vendor billing by moving to co-located Supabase pgvector in one dedicated Postgres instance.\n\nWould love to pass over the 2-minute benchmark comparison if you're open to exploring!`;
  };

  useEffect(() => {
    if (startup) {
      if (channel === 'email') {
        setEditedText(generateEmailPitch(startup));
      } else {
        setEditedText(generateLinkedInPitch(startup));
      }
    }
  }, [startup, channel]);

  if (!startup) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBottleneckDetails = (stack: string) => {
    const s = (stack || '').toLowerCase();
    if (s.includes('firebase') || s.includes('firestore')) {
      return {
        title: 'Relational Deficit & Vector Fragmentation',
        desc: 'Firestore lacks native SQL JOINs across multi-turn context buffers. Pairing with Pinecone introduces a 30–50ms external network hop and dual-vendor billing sprawl.'
      };
    }
    if (s.includes('mongo')) {
      return {
        title: 'BSON Storage Overhead & Vector Pricing Lag',
        desc: 'MongoDB Atlas vector search operates as an expensive external add-on with cold-start latency compared to native pgvector co-located on Postgres.'
      };
    }
    if (s.includes('dynamo') || s.includes('amplify')) {
      return {
        title: 'Partition Key Lock-in & Query Rigidity',
        desc: 'DynamoDB requires predefined partition keys, making ad-hoc multi-dimensional agent memory queries slow and reliant on complex GSI indexes.'
      };
    }
    if (s.includes('planetscale')) {
      return {
        title: 'MySQL Vector Isolation & Higher Tier TCO',
        desc: 'PlanetScale lacks integrated Auth, Storage, and native ACID vector embedding tables, forcing developers to manage separate SaaS infrastructure.'
      };
    }
    if (s.includes('convex')) {
      return {
        title: 'Proprietary Runtime & SQL Ecosystem Lock-in',
        desc: 'Convex locks teams into a proprietary backend framework without direct access to PostgreSQL extensions like PostGIS or standard BI connectors.'
      };
    }
    return {
      title: 'Optimal Native Postgres Architecture',
      desc: 'Building native on Supabase Postgres with pgvector, native Row Level Security, and co-located Edge Functions.'
    };
  };

  const bottleneck = getBottleneckDetails(startup.database_stack);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0B0F19] border-l border-white/[0.08] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#111827]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/25 flex items-center justify-center text-[#3ECF8E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Outbound Conversion Generator</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-white/[0.08]">
                  {startup.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">PAS positioning & quantified architectural migration value</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-tactile p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current Tech Stack Profile */}
          <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-mono">
              Detected Stack Signature
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Primary Database</span>
                <span className="font-semibold text-white bg-[#0B0F19] px-2.5 py-1 rounded border border-white/[0.08] inline-block font-mono">
                  {startup.database_stack}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Vector Search Index</span>
                <span className="font-semibold text-[#3ECF8E] bg-[#0B0F19] px-2.5 py-1 rounded border border-[#3ECF8E]/25 inline-block font-mono">
                  {startup.vector_search}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Frontend / Runtime</span>
                <span className="font-semibold text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded border border-white/[0.08] inline-block font-mono">
                  {startup.framework}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Migration Opportunity</span>
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/25 inline-block font-mono">
                  {startup.migration_opportunity_score} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Architectural Bottleneck Analysis */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1.5 font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>⚠ ARCHITECTURAL BOTTLENECK DETECTED</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-3">{bottleneck.desc}</p>
            <div className="flex items-center gap-2 text-[11px] text-[#3ECF8E] font-medium bg-[#0B0F19]/80 p-2.5 rounded-lg border border-[#3ECF8E]/25">
              <Cpu className="w-3.5 h-3.5 shrink-0 text-[#3ECF8E]" />
              <span>Supabase Fix: Dedicated compute + co-located pgvector SQL joins yielding ~32% TCO reduction.</span>
            </div>
          </div>

          {/* Channel Selector Tabs (Email vs LinkedIn/Text) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 bg-[#111827] p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    channel === 'email'
                      ? 'bg-[#3ECF8E] text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Direct Email (PAS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('linkedin')}
                  className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    channel === 'linkedin'
                      ? 'bg-[#3ECF8E] text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>LinkedIn InMail</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">100% Tailored · Editable</span>
            </div>

            {/* Outreach Pitch Textarea */}
            <textarea
              rows={9}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full bg-[#111827] border border-white/[0.08] rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/50 transition-colors resize-none selection:bg-[#3ECF8E]/30"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/[0.08] bg-[#111827]/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            <span className="text-slate-300">Target Opportunity: </span>
            <span className="text-[#3ECF8E] font-bold">$36,000 / yr</span>
          </div>
          <button
            onClick={handleCopy}
            className="btn-tactile flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#3ECF8E]/20 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
