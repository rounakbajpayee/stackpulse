import React, { useState } from 'react';
import { X, Calculator, DollarSign, RotateCcw } from 'lucide-react';
import { PipelineAssumptions } from '../lib/types';
import { DEFAULT_PIPELINE_ASSUMPTIONS } from '../lib/workspace-store';

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
  onSave,
}) => {
  const [enterpriseARR, setEnterpriseARR] = useState(assumptions.enterpriseARR);
  const [growthARR, setGrowthARR] = useState(assumptions.growthARR);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ enterpriseARR, growthARR });
    onClose();
  };

  const handleReset = () => {
    setEnterpriseARR(DEFAULT_PIPELINE_ASSUMPTIONS.enterpriseARR);
    setGrowthARR(DEFAULT_PIPELINE_ASSUMPTIONS.growthARR);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Pipeline Valuation Math
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Configure estimated Annual Recurring Revenue (ARR) assumptions per displacement opportunity tier. These numbers dynamically drive top-strip portfolio valuations.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              High Opportunity / Enterprise Deal Size (ARR)
            </label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min={1000}
                step={1000}
                value={enterpriseARR}
                onChange={(e) => setEnterpriseARR(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Applied to Firebase, DynamoDB, MongoDB displacement targets (Default: $36,000/yr).
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Growth Tier Deal Size (ARR)
            </label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min={1000}
                step={1000}
                value={growthARR}
                onChange={(e) => setGrowthARR(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Applied to Aurora/RDS/PlanetScale modernization targets (Default: $12,000/yr).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
              >
                Apply Math
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
