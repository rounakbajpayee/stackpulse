import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, AlertCircle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { Startup } from '../lib/types';

interface PitchModalProps {
  startup: Startup | null;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ startup, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [editedPitch, setEditedPitch] = useState('');

  React.useEffect(() => {
    if (startup) {
      setEditedPitch(startup.ae_outbound_pitch);
    }
  }, [startup]);

  if (!startup) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBottleneckDetails = (stack: string) => {
    const s = (stack || '').toLowerCase();
    if (s.includes('firebase') || s.includes('firestore')) {
      return {
        title: 'Relational Deficit & Vector Fragmentation',
        desc: 'Firestore lacks native SQL JOINs across multi-turn context buffers. Pairing with Pinecone introduces a separate network hop and double-billing.'
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
      <div className="w-full max-w-xl bg-[#0B0F19] border-l border-[#1F2937] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AE Outreach Strategy</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {startup.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Technical migration positioning & commercial value proposition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Tech Stack Profile */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Detected Stack Signature
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Primary Database</span>
                <span className="font-semibold text-white bg-[#0B0F19] px-2.5 py-1 rounded border border-[#1F2937] inline-block">
                  {startup.database_stack}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Vector Search Index</span>
                <span className="font-semibold text-[#3ECF8E] bg-[#0B0F19] px-2.5 py-1 rounded border border-[#1F2937] inline-block font-mono">
                  {startup.vector_search}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Frontend / Runtime</span>
                <span className="font-semibold text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded border border-[#1F2937] inline-block">
                  {startup.framework}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Migration Opportunity</span>
                <span className="font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/40 inline-block font-mono">
                  {startup.migration_opportunity_score} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Architectural Bottleneck Analysis */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{bottleneck.title}</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-3">{bottleneck.desc}</p>
            <div className="flex items-center gap-2 text-[11px] text-[#3ECF8E] font-medium bg-[#0B0F19]/60 p-2.5 rounded-lg border border-[#3ECF8E]/20">
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>Supabase Fix: Dedicated compute + co-located pgvector + Row Level Security in 1 ACID engine.</span>
            </div>
          </div>

          {/* Tailored AE Outbound Pitch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Tailored 3-Line Outbound Email (Editable)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Cold Outreach / LinkedIn</span>
            </div>
            <textarea
              rows={6}
              value={editedPitch}
              onChange={(e) => setEditedPitch(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-4 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-[#3ECF8E] transition-colors font-sans resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#1F2937] bg-[#111827]/50 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Estimated Target ARR: </span>
            <span className="text-[#3ECF8E] font-mono font-bold">$36,000 / yr</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold text-xs transition-all shadow-lg shadow-[#3ECF8E]/20 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Outreach Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
