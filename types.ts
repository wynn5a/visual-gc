export enum RegionType {
  FREE = 'FREE',
  EDEN = 'EDEN',
  SURVIVOR = 'SURVIVOR',
  OLD = 'OLD',
  HUMONGOUS = 'HUMONGOUS' // Simplified for this demo, usually just handled as special OLD
}

export enum GCPhase {
  IDLE = 'Allocating',
  YOUNG_GC = 'Young GC (Stop-The-World)',
  CONCURRENT_MARK = 'Concurrent Marking',
  MIXED_GC = 'Mixed GC (Evacuation)',
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
  mixedGCs: number;
  memoryUsage: number; // Percentage
  avgPauseTime: number; // ms (simulated)
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'warn' | 'success' | 'error';
  timestamp: string;
}