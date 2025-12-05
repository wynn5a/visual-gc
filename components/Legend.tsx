import React from 'react';
import { RegionType } from '../types';
import { COLORS } from '../constants';

const LegendItem: React.FC<{ colorClass: string; label: string }> = ({ colorClass, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-4 h-4 rounded ${colorClass} border`}></div>
    <span className="text-xs text-slate-300 font-medium">{label}</span>
  </div>
);

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
      <LegendItem colorClass={COLORS[RegionType.FREE]} label="Free" />
      <LegendItem colorClass={COLORS[RegionType.EDEN]} label="Eden (Young)" />
      <LegendItem colorClass={COLORS[RegionType.SURVIVOR]} label="Survivor (Young)" />
      <LegendItem colorClass={COLORS[RegionType.OLD]} label="Old (Tenured)" />
      
      <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block"></div>
      
      <LegendItem 
        colorClass="bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]" 
        label="Processing (Targeted)" 
      />
    </div>
  );
};