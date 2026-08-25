import React, { useState } from 'react';
import { X, Calculator, Sliders, DollarSign, Shield, Cpu, Layers, RotateCcw, Info } from 'lucide-react';
import { PipelineAssumptions } from '../lib/types';
import { DEFAULT_FINANCIAL_ASSUMPTIONS } from '../lib/ontology';

interface PipelineMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  assumptions: PipelineAssumptions;
  onSave: (assumptions: PipelineAssumptions) => void;
}

export const PipelineMathModal: React.FC<PipelineMathModalProps> = ({
  isOpen,
  onClose,
  assumptions,
  onSave
}) => {
  const [form, setForm] = useState<PipelineAssumptions>(assumptions);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    setForm({
      ...form,
      ...DEFAULT_FINANCIAL_ASSUMPTIONS
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Financial & Pricing Ontology Builder</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Mathematical Model
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure compute vintage baselines, tool consolidation add-ons, and compliance multipliers.
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

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Compute Base ARR by Cohort Vintage */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  1. Compute Base ARR by Cohort Vintage
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">Infrastructure scale based on company age</span>
            </div>

            {/* Mature Vintage */}
            <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span>Mature Series A/B+ (YC 2021 & earlier)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Dedicated 4XL + High I/O)</span>
                </label>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ${form.matureComputeArr.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="120000"
                step="2000"
                value={form.matureComputeArr}
                onChange={(e) => setForm({ ...form, matureComputeArr: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Growth Vintage */}
            <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span>Growth Stage (YC 2022 - 2023)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Dedicated 2XL Compute)</span>
                </label>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ${form.growthComputeArr.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min="6000"
                max="60000"
                step="1000"
                value={form.growthComputeArr}
                onChange={(e) => setForm({ ...form, growthComputeArr: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Early Stage */}
            <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span>Emerging / New Batch (YC 2024 - 2025)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Pro Tier / Shared Compute)</span>
                </label>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ${form.earlyComputeArr.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="1000"
                value={form.earlyComputeArr}
                onChange={(e) => setForm({ ...form, earlyComputeArr: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
            </div>
          </div>

          {/* Section 2: Tool Consolidation Add-On Values */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  2. Tool Consolidation Add-On Values
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">Added to ARR when fragmented tools are displaced</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Vector Add-on */}
              <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Pinecone / Qdrant</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +${form.vectorConsolidationArr.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30000"
                  step="1000"
                  value={form.vectorConsolidationArr}
                  onChange={(e) => setForm({ ...form, vectorConsolidationArr: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <p className="text-[10px] text-zinc-400">Consolidating vector store to pgvector</p>
              </div>

              {/* Auth Add-on */}
              <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Clerk / Auth0</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +${form.authConsolidationArr.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="1000"
                  value={form.authConsolidationArr}
                  onChange={(e) => setForm({ ...form, authConsolidationArr: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <p className="text-[10px] text-zinc-400">Replacing 3rd-party MAU auth billing</p>
              </div>

              {/* Cache Add-on */}
              <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Redis / ElastiCache</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +${form.cacheConsolidationArr.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="1000"
                  value={form.cacheConsolidationArr}
                  onChange={(e) => setForm({ ...form, cacheConsolidationArr: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <p className="text-[10px] text-zinc-400">Consolidating KV cache layer</p>
              </div>
            </div>
          </div>

          {/* Section 3: Compliance & Regulatory Multiplier */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  3. Compliance & Regulatory Multiplier
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">Fintech, HealthTech, LegalTech</span>
            </div>

            <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Regulated Industry SOC2 / HIPAA BAA Premium
                </label>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +${form.regulatedSectorMultiplier.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="2500"
                value={form.regulatedSectorMultiplier}
                onChange={(e) => setForm({ ...form, regulatedSectorMultiplier: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Automatically added to accounts handling sensitive data requiring dedicated VPC peering, audit logging, and enterprise security SLAs.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
              >
                Apply Model & Recalculate
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
