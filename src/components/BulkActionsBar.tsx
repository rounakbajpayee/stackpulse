import React, { useState } from 'react';
import { 
  CheckSquare, 
  Trash2, 
  ShieldCheck, 
  Download, 
  X,
  RotateCw,
  Info,
  Layers
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkVerify: () => void;
  onBulkAutoVerify?: () => void;
  onExportCsv: () => void;
  isGuest: boolean;
  isAutoVerifying?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalFilteredCount,
  onSelectAllFiltered,
  onClearSelection,
  onBulkDelete,
  onBulkVerify,
  onBulkAutoVerify,
  onExportCsv,
  isGuest,
  isAutoVerifying = false
}) => {
  const [showInfo, setShowInfo] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl shadow-2xl border border-zinc-800 dark:border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Count & Select All */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold font-mono text-emerald-400 dark:text-emerald-600">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedCount}</span>
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">accounts selected</span>

          {selectedCount < totalFilteredCount && (
            <button
              onClick={onSelectAllFiltered}
              className="text-emerald-400 dark:text-emerald-600 hover:underline font-semibold text-[11px] ml-1"
            >
              Select all {totalFilteredCount.toLocaleString()}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Smart On-Demand Auto-Verify */}
          {onBulkAutoVerify && (
            <button
              onClick={onBulkAutoVerify}
              disabled={isAutoVerifying}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xs transition-colors"
              title="Run targeted missing-step scraper verification on selected accounts"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoVerifying ? 'animate-spin' : ''}`} />
              <span>{isAutoVerifying ? 'Verifying...' : 'Auto-Verify ⚡'}</span>
            </button>
          )}

          {/* Bulk Verify Button */}
          <button
            onClick={onBulkVerify}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 font-medium transition-colors"
            title="Mark all selected as verified"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span className="hidden sm:inline">Mark Verified</span>
          </button>

          {/* Bulk Delete Button */}
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 dark:bg-rose-100 hover:bg-rose-900 dark:hover:bg-rose-200 text-rose-300 dark:text-rose-700 font-medium transition-colors"
            title="Remove from current territory"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 font-medium transition-colors"
            title="Download selected accounts as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-800 transition-colors ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
