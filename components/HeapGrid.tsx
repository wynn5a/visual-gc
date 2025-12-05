
import React, { useState } from 'react';
import { Region, RegionType } from '../types';
import { COLORS, TEXT_COLORS, GRID_COLS, REGION_LABELS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface HeapGridProps {
  regions: Region[];
}

export const HeapGrid: React.FC<HeapGridProps> = ({ regions }) => {
  return (
    <div
      className="grid gap-0.5 md:gap-1 bg-slate-900 p-2 md:p-3 rounded-xl shadow-2xl border border-slate-800 h-full w-full"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_COLS}, 1fr)`
      }}
    >
      {regions.map((region) => (
        <RegionCell key={region.id} region={region} />
      ))}
    </div>
  );
};

interface TooltipInfo {
  type: string;
  description: string;
  metrics: { label: string; value: string }[];
}

function getRegionTooltip(region: Region): TooltipInfo {
  const baseMetrics = [
    { label: 'Usage', value: `${Math.round(region.usedPercentage)}%` },
    { label: 'Liveness', value: `${Math.round(region.livenessPercentage)}%` },
  ];

  switch (region.type) {
    case RegionType.FREE:
      return {
        type: 'Free Region',
        description: 'Available for allocation',
        metrics: []
      };
    case RegionType.EDEN:
      return {
        type: 'Eden Region',
        description: 'New objects allocated here',
        metrics: [...baseMetrics, { label: 'Age', value: `${region.age}` }]
      };
    case RegionType.SURVIVOR:
      return {
        type: 'Survivor Region',
        description: `Survived ${region.age} GC cycle(s)`,
        metrics: [...baseMetrics, { label: 'Age', value: `${region.age}` }]
      };
    case RegionType.OLD:
      return {
        type: 'Old Region',
        description: 'Long-lived objects (tenured)',
        metrics: baseMetrics
      };
    case RegionType.HUMONGOUS:
      return {
        type: 'Humongous Region',
        description: 'Large object (> 50% region)',
        metrics: baseMetrics
      };
    case RegionType.Z_PAGE:
      return {
        type: 'Z Page',
        description: 'Active ZGC memory page',
        metrics: baseMetrics
      };
    case RegionType.Z_RELOCATING:
      return {
        type: 'Relocating Page',
        description: 'Objects being moved concurrently',
        metrics: baseMetrics
      };
    default:
      return {
        type: 'Region',
        description: '',
        metrics: baseMetrics
      };
  }
}

const RegionCell: React.FC<{ region: Region }> = React.memo(({ region }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const label = REGION_LABELS[region.type];
  const tooltip = getRegionTooltip(region);

  return (
    <motion.div
      initial={false}
      animate={{
        scale: region.isTargeted ? 0.9 : 1,
      }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`
        aspect-square w-full h-full
        rounded-[2px] md:rounded-sm border border-opacity-30
        flex flex-col items-center justify-center relative overflow-visible
        cursor-pointer transition-shadow duration-200
        ${region.isTargeted
          ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)] z-20'
          : COLORS[region.type]}
        ${!region.isTargeted && region.type !== RegionType.FREE ? 'hover:shadow-lg hover:brightness-110' : ''}
      `}
    >
      {region.type !== RegionType.FREE && (
        <>
          {/* Label */}
          <span className={`font-bold text-[10px] md:text-sm ${region.isTargeted ? 'text-white' : TEXT_COLORS[region.type]} z-10 select-none`}>
            {label}
          </span>

          {/* Usage Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[15%] bg-black/30">
            <motion.div
              className="h-full bg-white/50"
              initial={false}
              animate={{ width: `${region.usedPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Age dots (G1 only really) */}
          {region.age > 0 && (
            <div className="absolute top-0.5 right-0.5 flex flex-col gap-[1px]">
              {Array.from({ length: Math.min(region.age, 3) }).map((_, i) => (
                <div key={i} className="w-[3px] h-[3px] rounded-full bg-white/70" />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && region.type !== RegionType.FREE && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
            style={{ minWidth: '140px' }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 text-left">
              <p className={`font-medium text-xs ${TEXT_COLORS[region.type]}`}>{tooltip.type}</p>
              <p className="text-slate-400 text-[10px] mb-1">{tooltip.description}</p>
              {tooltip.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-1 mt-1 pt-1 border-t border-slate-700">
                  {tooltip.metrics.map((m, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[9px] text-slate-500">{m.label}</p>
                      <p className="text-[10px] text-slate-200 font-medium">{m.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Targeted indicator */}
      {region.isTargeted && (
        <motion.div
          className="absolute inset-0 rounded-[2px] md:rounded-sm"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.4)',
              '0 0 0 4px rgba(239, 68, 68, 0.2)',
              '0 0 0 0 rgba(239, 68, 68, 0.4)',
            ],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}, (prev, next) => {
  return prev.region.type === next.region.type &&
    prev.region.isTargeted === next.region.isTargeted &&
    prev.region.age === next.region.age &&
    prev.region.usedPercentage === next.region.usedPercentage &&
    prev.region.livenessPercentage === next.region.livenessPercentage;
});
