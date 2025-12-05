import React from 'react';
import { SimulationStats, GCPhase } from '../types';
import { Activity, Database, Clock, Zap } from 'lucide-react';

interface StatsPanelProps {
  stats: SimulationStats;
  currentPhase: GCPhase;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 flex items-center space-x-3">
    <div className={`p-1.5 rounded bg-opacity-20 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider truncate">{label}</p>
      <p className="text-slate-200 font-bold text-base leading-tight truncate">{value}</p>
    </div>
  </div>
);

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, currentPhase }) => {
  const getPhaseColor = (phase: GCPhase) => {
    switch (phase) {
      case GCPhase.YOUNG_GC: return "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]";
      case GCPhase.MIXED_GC: return "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]";
      case GCPhase.CONCURRENT_MARK: return "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]";
      default: return "text-emerald-400";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-0">
      <div className="col-span-2 bg-slate-900 p-3 rounded border border-slate-800 flex flex-col justify-center items-center shadow-inner min-h-[80px]">
         <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Current Phase</p>
         <div className={`text-lg font-black flex items-center gap-2 transition-all duration-300 ${getPhaseColor(currentPhase)}`}>
            {currentPhase === GCPhase.IDLE ? <Zap size={18} /> : <Activity size={18} className="animate-pulse" />}
            <span className="truncate">{currentPhase}</span>
         </div>
         {currentPhase !== GCPhase.IDLE && (
            <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-current w-1/3 animate-[shimmer_1s_infinite_linear]" />
            </div>
         )}
      </div>
      
      <StatCard 
        icon={<Database size={16} className="text-blue-400" />} 
        label="Heap Usage" 
        value={`${stats.memoryUsage.toFixed(1)}%`} 
        color="bg-blue-400"
      />
      <StatCard 
        icon={<Clock size={16} className="text-amber-400" />} 
        label="Total GCs" 
        value={stats.youngGCs + stats.mixedGCs} 
        color="bg-amber-400"
      />
      <StatCard 
        icon={<Activity size={16} className="text-emerald-400" />} 
        label="Allocations" 
        value={stats.allocations} 
        color="bg-emerald-400"
      />
      <StatCard 
        icon={<Zap size={16} className="text-red-400" />} 
        label="Collections" 
        value={`${stats.youngGCs}Y / ${stats.mixedGCs}M`} 
        color="bg-red-400"
      />
    </div>
  );
};