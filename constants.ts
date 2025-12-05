import { RegionType } from "./types";

export const GRID_ROWS = 10;
export const GRID_COLS = 10;
export const TOTAL_REGIONS = GRID_ROWS * GRID_COLS;

// Simulation Config
export const TICK_RATE_MS = 600; // Base speed
export const MAX_EDEN_REGIONS = 25; // Trigger Young GC when reached
export const OLD_GEN_THRESHOLD = 45; // Trigger Concurrent Mark when Total Heap > 45% (IHOP)
export const MAX_AGE = 3; // Age to promote to Old Gen

export const COLORS = {
  [RegionType.FREE]: "bg-slate-800 border-slate-700",
  [RegionType.EDEN]: "bg-emerald-500 border-emerald-400",
  [RegionType.SURVIVOR]: "bg-cyan-500 border-cyan-400",
  [RegionType.OLD]: "bg-amber-600 border-amber-500",
  [RegionType.HUMONGOUS]: "bg-purple-600 border-purple-500",
};

export const TEXT_COLORS = {
  [RegionType.FREE]: "text-slate-500",
  [RegionType.EDEN]: "text-emerald-950",
  [RegionType.SURVIVOR]: "text-cyan-950",
  [RegionType.OLD]: "text-amber-100",
  [RegionType.HUMONGOUS]: "text-purple-100",
};