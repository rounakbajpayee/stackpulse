import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, AlertTriangle, Send, Mail } from 'lucide-react';
import { Startup } from '../lib/types';

interface PitchModalProps {
  startup: Startup | null;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ startup, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!startup) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(startup.ae_outbound_pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#111827] border-l border-[#1F2937] h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-6 border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center text-[#3ECF8E]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AE Outreach · {startup.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tailored migration pitch generated from {startup.name}'s real stack profile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Quick Context Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Current Stack
                </span>
                <span className="text-xs font-semibold text-[#F59E0B]">{startup.database_stack}</span>
              </div>
              <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Vector DB
                </span>
                <span className="text-xs font-semibold text-slate-300">{startup.vector_search}</span>
              </div>
              <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-3">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  Migration Priority
                </span>
                <span className="text-xs font-semibold text-[#3ECF8E]">{startup.migration_opportunity_score}</span>
              </div>
            </div>

            {/* Technical Bottleneck Analysis */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Detected Architecture Bottleneck:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {startup.bottleneck_detected ||
                  'Firestore cannot perform relational joins across LLM context graphs. Splitting vector embeddings into Pinecone doubles latency and infrastructure overhead.'}
              </p>
            </div>

            {/* Pitch Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  <span>Generated Account Executive Pitch (Editable)</span>
                </label>
              </div>
              <textarea
                defaultValue={startup.ae_outbound_pitch}
                rows={8}
                className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl p-4 text-xs font-sans text-slate-200 leading-relaxed focus:outline-none focus:border-[#3ECF8E] transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#1F2937] bg-[#0B0F19]/60 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500">
            Estimated deal value: <span className="text-[#3ECF8E] font-semibold">$36K–$48K ARR</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34B87E] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#3ECF8E]/20 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Outreach Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
