import React, { useState, useRef, useEffect } from 'react';
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
      className="relative inline-flex items-center ml-1.5 z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={`Info about ${title}`}
        className="text-slate-400 hover:text-[#3ECF8E] transition-colors p-0.5 rounded-full hover:bg-[#1F2937]"
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
              ? 'top-full mt-2 right-0 sm:left-1/2 sm:-translate-x-1/2'
              : position === 'top'
              ? 'bottom-full mb-2 right-0 sm:left-1/2 sm:-translate-x-1/2'
              : position === 'right'
              ? 'left-full ml-2 top-1/2 -translate-y-1/2'
              : 'right-full mr-2 top-1/2 -translate-y-1/2'
          } w-72 sm:w-80 bg-[#0F172A] border border-[#334155] rounded-xl p-4 shadow-2xl backdrop-blur-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 z-[100]`}
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
                  {item.detail && <span className="text-[10px] text-slate-400 block leading-tight">{item.detail}</span>}
                </div>
                <span className="font-mono font-bold text-[#3ECF8E] shrink-0">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Summary Formula / Footnote */}
          {summaryFormula && (
            <div className="pt-2 border-t border-[#1F2937] text-[10px] text-slate-400 font-mono bg-[#0B0F19]/60 -mx-4 -mb-4 p-2.5 rounded-b-xl leading-relaxed">
              <span className="text-slate-400 font-sans font-semibold block mb-0.5">Calculation Logic:</span>
              {summaryFormula}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
