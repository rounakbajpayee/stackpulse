import React, { useState, useRef, useEffect } from 'react';
import { Info, ExternalLink } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  breakdown: { label: string; value: string; detail?: string }[];
  summaryFormula?: string;
  source?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  breakdown,
  summaryFormula,
  source,
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center ml-1.5 z-40"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={`Info about ${title}`}
        className="text-slate-400 hover:text-[#3ECF8E] transition-colors p-0.5 rounded-full hover:bg-[#1F2937]/80"
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
            position === 'bottom'
              ? 'top-full mt-2.5 right-0 sm:left-0 sm:right-auto'
              : position === 'top'
              ? 'bottom-full mb-2.5 right-0 sm:left-0 sm:right-auto'
              : position === 'right'
              ? 'left-full ml-2.5 top-0'
              : 'right-full mr-2.5 top-0'
          } w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#0B0F19] border border-[#334155] rounded-xl p-4 shadow-2xl backdrop-blur-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 z-[9999]`}
        >
          {/* Tooltip Header */}
          <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-[#1F2937]">
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E] shadow-[0_0_8px_#3ECF8E]"></span>
            <span className="text-xs font-bold text-white tracking-wide">{title}</span>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 mb-3 text-[11px]">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-slate-200 font-medium block">{item.label}</span>
                  {item.detail && <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">{item.detail}</span>}
                </div>
                <span className="font-mono font-bold text-[#3ECF8E] shrink-0">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Summary Formula */}
          {summaryFormula && (
            <div className="pt-2 border-t border-[#1F2937] text-[10px] text-slate-300 font-mono bg-[#111827]/70 -mx-4 p-3 leading-relaxed">
              <span className="text-slate-400 font-sans font-semibold block mb-0.5">Calculation Logic:</span>
              {summaryFormula}
            </div>
          )}

          {/* Source Citation */}
          {source && (
            <div className="pt-2 mt-2 border-t border-[#1F2937]/60 text-[10px] text-slate-400 flex items-start gap-1.5 leading-tight">
              <span className="font-semibold text-slate-300 shrink-0">Source:</span>
              <span>{source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
