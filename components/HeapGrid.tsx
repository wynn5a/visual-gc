import React from 'react';
import { Region, RegionType } from '../types';
import { COLORS, TEXT_COLORS, GRID_COLS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface HeapGridProps {
  regions: Region[];
}

export const HeapGrid: React.FC<HeapGridProps> = ({ regions }) => {
  return (
    <div 
      className="grid gap-0.5 md:gap-1 bg-slate-900 p-2 md:p-3 rounded-xl shadow-2xl border border-slate-800 h-full w-full"
      style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
    >
      <AnimatePresence>
        {regions.map((region) => (
          <RegionCell key={region.id} region={region} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const RegionCell: React.FC<{ region: Region }> = React.memo(({ region }) => {
  // Determine content based on type
  const label = region.type === RegionType.FREE ? "" : 
                region.type === RegionType.EDEN ? "E" :
                region.type === RegionType.SURVIVOR ? "S" :
                region.type === RegionType.OLD ? "O" : "H";

  return (
    <motion.div
      layout
      initial={{ opacity: 0.8, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: region.isTargeted ? 0.85 : 1,
        backgroundColor: region.isTargeted ? '#ef4444' : undefined,
        zIndex: region.isTargeted ? 20 : 0
      }}
      transition={{ duration: 0.2 }}
      className={`
        rounded-[2px] md:rounded-sm border border-opacity-30
        flex flex-col items-center justify-center relative overflow-hidden
        ${region.isTargeted ? 'bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : COLORS[region.type]}
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

          {/* Age dots */}
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