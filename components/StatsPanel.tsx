
import React from 'react';
import { SimulationStats, GCPhase } from '../types';
import { Activity, Database, Clock, Zap, Pause, Play, Info } from 'lucide-react';

interface StatsPanelProps {
  stats: SimulationStats;
  currentPhase: GCPhase;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, tooltip }) => (
  <div className="group relative bg-slate-900/60 p-3 rounded-xl border border-slate-800/50 flex items-center space-x-3 hover:bg-slate-800/40 transition-colors">
    <div className={`p-2 rounded-lg bg-opacity-20 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-slate-500 text-[10px] uppercase tracking-wider truncate flex items-center gap-1">
        {label}
        {tooltip && <Info size={10} className="text-slate-600" />}
      </p>
      <p className="text-slate-200 font-bold text-lg leading-tight truncate">{value}</p>
    </div>

    {/* Tooltip */}
    {tooltip && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
        <p className="text-xs text-slate-200">{tooltip}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700"></div>
      </div>
    )}
  </div>
);

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, currentPhase }) => {
  const phaseConfig = getPhaseConfig(currentPhase);
  const isSTW = currentPhase.includes('STW') || currentPhase === GCPhase.YOUNG_GC || currentPhase === GCPhase.MIXED_GC;
  const isZGC = currentPhase.toString().startsWith('ZGC');

  return (
    <div className="space-y-3">
      {/* Current Phase Display */}
      <div className={`bg-gradient-to-br ${phaseConfig.bgGradient} p-4 rounded-xl border ${phaseConfig.borderColor} shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider">Current Phase</p>
          {isSTW ? (
            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Pause size={10} />
              STW PAUSE
            </span>
          ) : currentPhase !== GCPhase.IDLE ? (
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Play size={10} />
              CONCURRENT
            </span>
          ) : null}
        </div>

        <div className={`text-xl font-black flex items-center gap-2 transition-all duration-300 ${phaseConfig.textColor}`}>
          {currentPhase === GCPhase.IDLE ? (
            <Zap size={20} />
          ) : (
            <Activity size={20} className="animate-pulse" />
          )}
          <span className="truncate">{currentPhase}</span>
        </div>

        {/* Phase Description */}
        <p className="text-slate-400 text-xs mt-2 line-clamp-2">
          {phaseConfig.description}
        </p>

        {/* Progress Bar */}
        {currentPhase !== GCPhase.IDLE && (
          <div className="w-full h-1.5 bg-slate-800 mt-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${phaseConfig.progressColor} animate-[shimmer_1.5s_infinite_linear]`}
              style={{ width: isSTW ? '100%' : '60%' }}
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Database size={16} className="text-blue-400" />}
          label="Heap Usage"
          value={`${stats.memoryUsage.toFixed(1)}%`}
          color="bg-blue-400"
          tooltip="Current heap memory utilization"
        />
        <StatCard
          icon={<Clock size={16} className="text-amber-400" />}
          label="Total GCs"
          value={stats.youngGCs + stats.mixedGCs}
          color="bg-amber-400"
          tooltip="Number of garbage collections performed"
        />
        <StatCard
          icon={<Activity size={16} className="text-emerald-400" />}
          label="Allocations"
          value={stats.allocations}
          color="bg-emerald-400"
          tooltip="Objects allocated to the heap"
        />
        <StatCard
          icon={<Zap size={16} className="text-purple-400" />}
          label={isZGC ? "ZGC Cycles" : "Collections"}
          value={isZGC ? `${stats.mixedGCs}` : `${stats.youngGCs}Y / ${stats.mixedGCs}M`}
          color="bg-purple-400"
          tooltip={isZGC ? "Complete ZGC collection cycles" : "Young GC / Mixed GC count"}
        />
      </div>
    </div>
  );
};

interface PhaseConfig {
  textColor: string;
  bgGradient: string;
  borderColor: string;
  progressColor: string;
  description: string;
}

function getPhaseConfig(phase: GCPhase): PhaseConfig {
  switch (phase) {
    case GCPhase.IDLE:
      return {
        textColor: 'text-emerald-400',
        bgGradient: 'from-slate-900 to-slate-900/80',
        borderColor: 'border-slate-800',
        progressColor: 'bg-emerald-500',
        description: 'Application running normally. Objects being allocated to Eden regions.'
      };
    case GCPhase.YOUNG_GC:
      return {
        textColor: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
        bgGradient: 'from-cyan-950/50 to-slate-900',
        borderColor: 'border-cyan-800/50',
        progressColor: 'bg-cyan-500',
        description: 'Stop-The-World pause. Copying live objects from Eden to Survivor regions.'
      };
    case GCPhase.CONCURRENT_MARK:
      return {
        textColor: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]',
        bgGradient: 'from-purple-950/50 to-slate-900',
        borderColor: 'border-purple-800/50',
        progressColor: 'bg-purple-500',
        description: 'Scanning heap concurrently to identify garbage-rich Old regions for collection.'
      };
    case GCPhase.MIXED_GC:
      return {
        textColor: 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]',
        bgGradient: 'from-orange-950/50 to-slate-900',
        borderColor: 'border-orange-800/50',
        progressColor: 'bg-orange-500',
        description: 'Collecting Young regions plus selected Old regions with most garbage.'
      };
    case GCPhase.ZGC_MARK_START:
      return {
        textColor: 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]',
        bgGradient: 'from-rose-950/50 to-slate-900',
        borderColor: 'border-rose-800/50',
        progressColor: 'bg-rose-500',
        description: 'Brief STW pause (<1ms) to initialize concurrent marking phase.'
      };
    case GCPhase.ZGC_CONCURRENT_MARK:
      return {
        textColor: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]',
        bgGradient: 'from-blue-950/50 to-slate-900',
        borderColor: 'border-blue-800/50',
        progressColor: 'bg-blue-500',
        description: 'Tracing object graph to find live objects. App continues running!'
      };
    case GCPhase.ZGC_MARK_END:
      return {
        textColor: 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]',
        bgGradient: 'from-rose-950/50 to-slate-900',
        borderColor: 'border-rose-800/50',
        progressColor: 'bg-rose-500',
        description: 'Brief STW pause (<1ms) to complete marking and prepare for relocation.'
      };
    case GCPhase.ZGC_CONCURRENT_RELOCATE:
      return {
        textColor: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]',
        bgGradient: 'from-indigo-950/50 to-slate-900',
        borderColor: 'border-indigo-800/50',
        progressColor: 'bg-indigo-500',
        description: 'Moving live objects to compact memory. App continues running!'
      };
    default:
      return {
        textColor: 'text-emerald-400',
        bgGradient: 'from-slate-900 to-slate-900/80',
        borderColor: 'border-slate-800',
        progressColor: 'bg-emerald-500',
        description: 'System idle.'
      };
  }
}
