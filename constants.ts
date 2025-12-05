
import { RegionType } from "./types";

// Grid Configuration
export const GRID_ROWS = 10;
export const GRID_COLS = 10;
export const TOTAL_REGIONS = GRID_ROWS * GRID_COLS;

// Simulation Timing
export const TICK_RATE_MS = 600;

// G1 GC Configuration
export const G1_CONFIG = {
  MAX_EDEN_REGIONS: 25,           // Trigger Young GC when reached
  OLD_GEN_THRESHOLD: 45,          // Trigger Concurrent Mark when Total Heap > 45% (IHOP)
  MAX_AGE: 3,                     // Age to promote to Old Gen
  HUMONGOUS_CHANCE: 0.05,         // 5% chance for humongous allocation
  TARGET_FILL_RATE: 85,           // Target fill rate for compacted regions
  MIXED_GC_LIVENESS_THRESHOLD: 65, // Regions with liveness below this are candidates
  MIXED_GC_MAX_CSET_SIZE: 8,      // Maximum regions in Mixed GC CSet
} as const;

// ZGC Configuration
export const ZGC_CONFIG = {
  HEAP_TRIGGER_THRESHOLD: 50,     // Trigger ZGC when heap > 50%
  LIVENESS_THRESHOLD: 70,         // Regions with liveness below this are relocation candidates
  MAX_RELOCATION_PAGES: 8,        // Max pages to relocate at once
  PAGES_TO_FREE_PER_TICK: 3,      // Pages to free per relocation tick
  MIN_LIVE_DATA_FOR_PAGE: 30,     // Minimum live data to create a new page
  CONCURRENT_ALLOC_CHANCE: 0.2,   // Chance to allocate during concurrent phases
  RELOCATION_ALLOC_CHANCE: 0.1,   // Chance to allocate during relocation
} as const;

// Animation Delays (ms)
export const ANIMATION_DELAYS = {
  YOUNG_GC_START: 600,
  YOUNG_GC_HIGHLIGHT: 600,
  CONCURRENT_MARK: 1000,
  MIXED_GC_START: 800,
  MIXED_GC_HIGHLIGHT: 800,
  ZGC_STW_PAUSE: 200,
} as const;

// Visual Colors by Region Type
export const COLORS: Record<RegionType, string> = {
  [RegionType.FREE]: "bg-slate-800 border-slate-700",
  [RegionType.EDEN]: "bg-emerald-500 border-emerald-400",
  [RegionType.SURVIVOR]: "bg-cyan-500 border-cyan-400",
  [RegionType.OLD]: "bg-amber-600 border-amber-500",
  [RegionType.HUMONGOUS]: "bg-purple-600 border-purple-500",
  [RegionType.Z_PAGE]: "bg-indigo-600 border-indigo-500",
  [RegionType.Z_RELOCATING]: "bg-indigo-400 border-indigo-300",
};

export const TEXT_COLORS: Record<RegionType, string> = {
  [RegionType.FREE]: "text-slate-500",
  [RegionType.EDEN]: "text-emerald-950",
  [RegionType.SURVIVOR]: "text-cyan-950",
  [RegionType.OLD]: "text-amber-100",
  [RegionType.HUMONGOUS]: "text-purple-100",
  [RegionType.Z_PAGE]: "text-indigo-100",
  [RegionType.Z_RELOCATING]: "text-indigo-900",
};

// Region Labels for Display
export const REGION_LABELS: Record<RegionType, string> = {
  [RegionType.FREE]: "",
  [RegionType.EDEN]: "E",
  [RegionType.SURVIVOR]: "S",
  [RegionType.OLD]: "O",
  [RegionType.HUMONGOUS]: "H",
  [RegionType.Z_PAGE]: "Z",
  [RegionType.Z_RELOCATING]: "R",
};

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use G1_CONFIG.MAX_EDEN_REGIONS instead */
export const MAX_EDEN_REGIONS = G1_CONFIG.MAX_EDEN_REGIONS;
/** @deprecated Use G1_CONFIG.OLD_GEN_THRESHOLD instead */
export const OLD_GEN_THRESHOLD = G1_CONFIG.OLD_GEN_THRESHOLD;
/** @deprecated Use G1_CONFIG.MAX_AGE instead */
export const MAX_AGE = G1_CONFIG.MAX_AGE;
/** @deprecated Use ZGC_CONFIG.HEAP_TRIGGER_THRESHOLD instead */
export const ZGC_HEAP_THRESHOLD = ZGC_CONFIG.HEAP_TRIGGER_THRESHOLD;
