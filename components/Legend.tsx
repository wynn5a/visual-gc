
import React from 'react';
import { RegionType, GCMode } from '../types';
import { COLORS } from '../constants';
import { HelpCircle } from 'lucide-react';

interface LegendItemProps {
  colorClass: string;
  label: string;
  description: string;
  letter?: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ colorClass, label, description, letter }) => (
  <div className="group relative flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-help">
    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md ${colorClass} border flex items-center justify-center shadow-sm`}>
      {letter && <span className="text-[8px] md:text-[10px] font-bold text-white/90">{letter}</span>}
    </div>
    <span className="text-[10px] md:text-xs text-slate-300 font-medium">{label}</span>

    {/* Tooltip - hidden on mobile */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap hidden md:block">
      <p className="text-xs text-slate-200">{description}</p>
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700"></div>
    </div>
  </div>
);

interface LegendProps {
  mode: GCMode;
}

export const Legend: React.FC<LegendProps> = ({ mode }) => {
  return (
    <div className="flex flex-wrap items-center gap-0.5 md:gap-1 p-2 md:p-3 bg-slate-900/80 backdrop-blur-sm overflow-x-auto">
      {/* Tip indicator */}
      <div className="hidden sm:flex items-center gap-1 text-slate-500 text-xs mr-2 pr-3 border-r border-slate-700">
        <HelpCircle size={12} />
        <span className="hidden md:inline">Hover for info</span>
      </div>

      <LegendItem
        colorClass={COLORS[RegionType.FREE]}
        label="Free"
        description="Available for allocation"
      />

      {mode === GCMode.G1 ? (
        <>
          <LegendItem
            colorClass={COLORS[RegionType.EDEN]}
            label="Eden"
            letter="E"
            description="New objects are allocated here (Young Gen)"
          />
          <LegendItem
            colorClass={COLORS[RegionType.SURVIVOR]}
            label="Survivor"
            letter="S"
            description="Objects that survived a Young GC (Young Gen)"
          />
          <LegendItem
            colorClass={COLORS[RegionType.OLD]}
            label="Old"
            letter="O"
            description="Long-lived objects (survived 3+ GCs)"
          />
          <LegendItem
            colorClass={COLORS[RegionType.HUMONGOUS]}
            label="Humongous"
            letter="H"
            description="Large objects (> 50% of region size)"
          />
        </>
      ) : (
        <>
          <LegendItem
            colorClass={COLORS[RegionType.Z_PAGE]}
            label="Z Page"
            letter="Z"
            description="Active page with objects"
          />
          <LegendItem
            colorClass={COLORS[RegionType.Z_RELOCATING]}
            label="Relocating"
            letter="R"
            description="Objects being moved (concurrent)"
          />
        </>
      )}

      <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>

      <LegendItem
        colorClass="bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        label="Targeted"
        description={mode === GCMode.G1 ? "Being collected (Stop-The-World)" : "Being scanned or processed"}
      />

      {/* Stats hint */}
      <div className="hidden lg:flex items-center gap-2 ml-auto text-slate-500 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
        </span>
        <span>Dots = object age</span>
      </div>
    </div>
  );
};
