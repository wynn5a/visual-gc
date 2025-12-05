
export enum GCMode {
  G1 = 'G1',
  ZGC = 'ZGC'
}

export enum RegionType {
  FREE = 'FREE',
  EDEN = 'EDEN',
  SURVIVOR = 'SURVIVOR',
  OLD = 'OLD',
  HUMONGOUS = 'HUMONGOUS',
  Z_PAGE = 'Z_PAGE',
  Z_RELOCATING = 'Z_RELOCATING'
}

export enum GCPhase {
  IDLE = 'Allocating',
  
  // G1 Phases
  YOUNG_GC = 'Young GC (Stop-The-World)',
  CONCURRENT_MARK = 'Concurrent Marking',
  MIXED_GC = 'Mixed GC (Evacuation)',

  // ZGC Phases
  ZGC_MARK_START = 'ZGC Mark Start (STW)',
  ZGC_CONCURRENT_MARK = 'ZGC Concurrent Mark',
  ZGC_MARK_END = 'ZGC Mark End (STW)',
  ZGC_CONCURRENT_RELOCATE = 'ZGC Concurrent Relocate',
}

export interface Region {
  id: number;
  type: RegionType;
  usedPercentage: number; // 0-100
  livenessPercentage: number; // 0-100, how much is actual live data vs garbage
  age: number; // How many collections it has survived
  isTargeted: boolean; // Being processed in current step
}

export interface SimulationStats {
  allocations: number;
  youngGCs: number;
  mixedGCs: number; // Also used for ZGC Major Cycles
  memoryUsage: number; // Percentage
  avgPauseTime: number; // ms (simulated)
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'warn' | 'success' | 'error';
  timestamp: string;
}
