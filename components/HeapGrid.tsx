
import React from 'react';
import { Region, RegionType } from '../types';
import { COLORS, TEXT_COLORS, GRID_COLS, REGION_LABELS } from '../constants';
import { motion } from 'framer-motion';

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

const RegionCell: React.FC<{ region: Region }> = React.memo(({ region }) => {
  const label = REGION_LABELS[region.type];

  return (
    <motion.div
      initial={false}
      animate={{
        scale: region.isTargeted ? 0.9 : 1,
      }}
      transition={{ duration: 0.15 }}
      className={`
        aspect-square w-full h-full
        rounded-[2px] md:rounded-sm border border-opacity-30
        flex flex-col items-center justify-center relative overflow-hidden
        ${region.isTargeted ? 'bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)] z-20' : COLORS[region.type]}
      `}
    >
      {region.type !== RegionType.FREE && (
        <>
          {/* Label */}
          <span className={`font-bold text-[10px] md:text-sm ${TEXT_COLORS[region.type]} z-10 select-none`}>
            {label}
          </span>

          {/* Usage Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[15%] bg-black/30">
            <div
              className="h-full bg-white/50 transition-all duration-500"
              style={{ width: `${region.usedPercentage}%` }}
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
    </motion.div>
  );
}, (prev, next) => {
  return prev.region.type === next.region.type &&
    prev.region.isTargeted === next.region.isTargeted &&
    prev.region.age === next.region.age &&
    prev.region.usedPercentage === next.region.usedPercentage;
});
