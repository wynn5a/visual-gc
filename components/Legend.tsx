
import React from 'react';
import { RegionType, GCMode } from '../types';
import { COLORS } from '../constants';

const LegendItem: React.FC<{ colorClass: string; label: string }> = ({ colorClass, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-4 h-4 rounded ${colorClass} border`}></div>
    <span className="text-xs text-slate-300 font-medium">{label}</span>
  </div>
);

interface LegendProps {
  mode: GCMode;
}

export const Legend: React.FC<LegendProps> = ({ mode }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
      <LegendItem colorClass={COLORS[RegionType.FREE]} label="Free" />
      
      {mode === GCMode.G1 ? (
        <>
          <LegendItem colorClass={COLORS[RegionType.EDEN]} label="Eden (Young)" />
          <LegendItem colorClass={COLORS[RegionType.SURVIVOR]} label="Survivor (Young)" />
          <LegendItem colorClass={COLORS[RegionType.OLD]} label="Old (Tenured)" />
        </>
      ) : (
        <>
          <LegendItem colorClass={COLORS[RegionType.Z_PAGE]} label="Z Page (Used)" />
          <LegendItem colorClass={COLORS[RegionType.Z_RELOCATING]} label="Relocating" />
        </>
      )}
      
      <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block"></div>
      
      <LegendItem 
        colorClass="bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]" 
        label="Targeted / Scanned" 
      />
    </div>
  );
};
