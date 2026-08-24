import React from 'react';
import { User, X, ArrowRight, ShieldAlert } from 'lucide-react';

interface GuestSoftPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  actionName?: string;
}

export const GuestSoftPrompt: React.FC<GuestSoftPromptProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  actionName = 'territory changes'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-2xl border border-zinc-800 dark:border-zinc-200 p-3.5 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 mt-0.5">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold">
              Guest Mode Active
            </p>
            <p className="text-[11px] text-zinc-300 dark:text-zinc-600 leading-snug">
              Your {actionName} are saved in this browser only and won't sync to your other devices.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 dark:text-emerald-600 hover:underline"
              >
                <span>Sign In to Sync Across Devices</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-100 dark:hover:text-zinc-900 p-0.5 rounded transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
