import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  breakdown: { label: string; value: string; detail?: string }[];
  summaryFormula?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  breakdown,
  summaryFormula,
  position = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center ml-1.5 cursor-pointer z-30"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={`Info about ${title}`}
        className="text-slate-400 hover:text-[#3ECF8E] transition-colors p-0.5 rounded-full hover:bg-[#1F2937]/60"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            position === 'top'
              ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
              : position === 'bottom'
              ? 'top-full mt-2.5 left-1/2 -translate-x-1/2'
              : position === 'right'
              ? 'left-full ml-2.5 top-1/2 -translate-y-1/2'
              : 'right-full mr-2.5 top-1/2 -translate-y-1/2'
          } w-72 sm:w-80 bg-[#0B0F19] border border-[#1F2937] rounded-xl p-4 shadow-2xl backdrop-blur-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Tooltip Header */}
          <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-[#1F2937]">
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E]"></span>
            <span className="text-xs font-bold text-white tracking-wide">{title}</span>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 mb-2.5 text-[11px]">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-slate-300 font-medium block">{item.label}</span>
                  {item.detail && <span className="text-[10px] text-slate-500 block leading-tight">{item.detail}</span>}
                </div>
                <span className="font-mono font-bold text-[#3ECF8E] shrink-0">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Summary Formula / Footnote */}
          {summaryFormula && (
            <div className="pt-2 border-t border-[#1F2937]/70 text-[10px] text-slate-400 font-mono bg-[#111827]/40 -mx-4 -mb-4 p-2.5 rounded-b-xl leading-relaxed">
              <span className="text-slate-500 font-sans block mb-0.5">Calculation Logic:</span>
              {summaryFormula}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
