import { useState, useEffect, useRef, useCallback } from 'react';
import { Region, RegionType, GCPhase, SimulationStats, LogEntry } from '../types';
import { TOTAL_REGIONS, MAX_EDEN_REGIONS, OLD_GEN_THRESHOLD, MAX_AGE, TICK_RATE_MS } from '../constants';

const INITIAL_REGIONS: Region[] = Array.from({ length: TOTAL_REGIONS }, (_, i) => ({
  id: i,
  type: RegionType.FREE,
  usedPercentage: 0,
  livenessPercentage: 0,
  age: 0,
  isTargeted: false,
}));

export const useG1Simulation = (isRunning: boolean, speedMultiplier: number) => {
  const [regions, setRegions] = useState<Region[]>(INITIAL_REGIONS);
  const [phase, setPhase] = useState<GCPhase>(GCPhase.IDLE);
  const [stats, setStats] = useState<SimulationStats>({
    allocations: 0,
    youngGCs: 0,
    mixedGCs: 0,
    memoryUsage: 0,
    avgPauseTime: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Use refs for simulation state to avoid closure staleness in intervals
  const regionsRef = useRef(regions);
  const phaseRef = useRef(phase);

  // Sync refs
  useEffect(() => { regionsRef.current = regions; }, [regions]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [entry, ...prev].slice(0, 50));
  }, []);

  const getHeapUsage = useCallback((currentRegions: Region[]) => {
    const used = currentRegions.filter(r => r.type !== RegionType.FREE).length;
    return (used / TOTAL_REGIONS) * 100;
  }, []);

  // --- Actions ---

  const allocate = useCallback(() => {
    const currentRegions = [...regionsRef.current];
    const freeIndices = currentRegions
      .map((r, i) => r.type === RegionType.FREE ? i : -1)
      .filter(i => i !== -1);

    if (freeIndices.length === 0) {
      // Full GC Panic (reset for demo simplicity)
      addLog("Heap Full! Triggering Full GC (Panic)...", "error");
      setRegions(currentRegions.map(r => ({ ...r, type: RegionType.FREE, usedPercentage: 0 })));
      setPhase(GCPhase.IDLE);
      return;
    }

    // Allocate 1-3 regions
    const count = Math.min(Math.floor(Math.random() * 2) + 1, freeIndices.length);
    for (let k = 0; k < count; k++) {
      const idx = freeIndices[Math.floor(Math.random() * freeIndices.length)];
      // Remove used index to avoid double picking
      const arrayIdx = freeIndices.indexOf(idx);
      if (arrayIdx > -1) freeIndices.splice(arrayIdx, 1);

      currentRegions[idx] = {
        ...currentRegions[idx],
        type: RegionType.EDEN,
        usedPercentage: Math.floor(Math.random() * 40) + 60, // 60-100% full
        livenessPercentage: Math.floor(Math.random() * 60) + 20, // 20-80% live
        age: 0,
      };
    }

    setRegions(currentRegions);
    setStats(prev => ({
      ...prev,
      allocations: prev.allocations + count,
      memoryUsage: getHeapUsage(currentRegions)
    }));
  }, [addLog, getHeapUsage]);

  const performYoungGC = useCallback(async () => {
    setPhase(GCPhase.YOUNG_GC);
    addLog("Young GC Started: Evacuating Eden...", "warn");

    // Pause for animation
    await new Promise(r => setTimeout(r, 600));

    const currentRegions = [...regionsRef.current];
    const edenRegions = currentRegions.filter(r => r.type === RegionType.EDEN);
    const survivorRegions = currentRegions.filter(r => r.type === RegionType.SURVIVOR);
    
    // Calculate promotions and survivals
    let promoted = 0;
    let survived = 0;
    let reclaimed = 0;

    // Process regions
    const newRegions = currentRegions.map(r => {
      if (r.type === RegionType.EDEN || r.type === RegionType.SURVIVOR) {
        // Simple logic: 
        // If age > MAX_AGE -> Promote to OLD
        // Else -> Move to SURVIVOR (simulated by just changing age/keeping survivor)
        // If liveness is very low -> Reclaim (Garbage)
        
        // Random chance to be garbage collected entirely
        if (Math.random() > (r.livenessPercentage / 100)) {
            reclaimed++;
            return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0, age: 0, isTargeted: false };
        }

        if (r.age >= MAX_AGE) {
          promoted++;
          return { 
            ...r, 
            type: RegionType.OLD, 
            age: r.age + 1,
            // Old gen usually accumulates garbage over time
            livenessPercentage: Math.max(10, r.livenessPercentage - 10), 
            isTargeted: false 
          };
        } else {
          survived++;
          return { 
            ...r, 
            type: RegionType.SURVIVOR, 
            age: r.age + 1,
            isTargeted: false
          };
        }
      }
      return r;
    });

    setRegions(newRegions);
    setStats(prev => ({
      ...prev,
      youngGCs: prev.youngGCs + 1,
      memoryUsage: getHeapUsage(newRegions)
    }));
    addLog(`Young GC Done. Promoted: ${promoted}, Survived: ${survived}, Reclaimed: ${reclaimed}`, "success");

    // Check for Concurrent Mark trigger
    const usage = getHeapUsage(newRegions);
    if (usage > OLD_GEN_THRESHOLD) {
        setTimeout(() => setPhase(GCPhase.CONCURRENT_MARK), 500);
    } else {
        setPhase(GCPhase.IDLE);
    }

  }, [addLog, getHeapUsage]);


  const performConcurrentMark = useCallback(async () => {
    addLog("Concurrent Marking Cycle Started (IHOP Triggered)", "info");
    
    // Simulate phases of marking
    // 1. Initial Mark (Piggybacks on Young GC usually, but we visualize separately)
    // 2. Remark (Scan stack)
    // 3. Cleanup (Identify empty regions)
    
    // Visualize scanning Old regions
    setRegions(prev => prev.map(r => r.type === RegionType.OLD ? { ...r, isTargeted: true } : r));
    await new Promise(r => setTimeout(r, 1000));
    
    // Identify regions with high garbage (low liveness)
    // Update liveness (simulate degradation over time)
    const afterMark = regionsRef.current.map(r => {
      if (r.type === RegionType.OLD) {
        return { 
            ...r, 
            isTargeted: false,
            // Simulate finding out true liveness
            livenessPercentage: Math.max(5, r.livenessPercentage - Math.floor(Math.random() * 20)) 
        };
      }
      return r;
    });

    setRegions(afterMark);
    addLog("Marking Finished. Candidate regions identified.", "info");
    setPhase(GCPhase.MIXED_GC);
  }, [addLog]);


  const performMixedGC = useCallback(async () => {
    addLog("Mixed GC Started: Collecting Young + Candidate Old Regions", "warn");
    await new Promise(r => setTimeout(r, 800));

    let currentRegions = [...regionsRef.current];
    
    // Filter Old regions with low liveness (Garbage First!)
    // We want to collect regions that are mostly garbage to get max ROI
    const candidateOldIndices = currentRegions
        .map((r, i) => (r.type === RegionType.OLD && r.livenessPercentage < 60) ? i : -1)
        .filter(i => i !== -1)
        .sort((a, b) => currentRegions[a].livenessPercentage - currentRegions[b].livenessPercentage) // Ascending liveness (most garbage first)
        .slice(0, 8); // Limit how many old regions we take in one go (Target Pause Time)

    // Mark them visually
    setRegions(prev => prev.map((r, i) => candidateOldIndices.includes(i) || r.type === RegionType.EDEN || r.type === RegionType.SURVIVOR ? { ...r, isTargeted: true } : r));
    await new Promise(r => setTimeout(r, 800));

    let reclaimedOld = 0;
    
    currentRegions = regionsRef.current.map((r, i) => {
        // Collect Young (Eden/Survivor) - Same logic as Young GC
        if (r.type === RegionType.EDEN || r.type === RegionType.SURVIVOR) {
             if (Math.random() > (r.livenessPercentage / 100)) {
                return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0, age: 0, isTargeted: false };
            }
            // Simply promote/survive logic simplified
            return { 
                ...r, 
                type: r.age >= MAX_AGE ? RegionType.OLD : RegionType.SURVIVOR, 
                age: r.age + 1,
                isTargeted: false
            };
        }

        // Collect Candidate Old
        if (candidateOldIndices.includes(i)) {
            // Evacuate live objects to other regions (simplified: just keep it Old but compact it, or free it if empty)
            // In simulation: if liveness is low, we reclaim it and assume live objects moved to another "Old" region (not visualized individually for density)
            reclaimedOld++;
            return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0, age: 0, isTargeted: false };
        }
        
        return { ...r, isTargeted: false };
    });

    setRegions(currentRegions);
    setStats(prev => ({
        ...prev,
        mixedGCs: prev.mixedGCs + 1,
        memoryUsage: getHeapUsage(currentRegions)
    }));
    addLog(`Mixed GC Done. Reclaimed ${reclaimedOld} Old Regions.`, "success");
    setPhase(GCPhase.IDLE);

  }, [addLog, getHeapUsage]);


  // --- Game Loop ---
  useEffect(() => {
    if (!isRunning) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const currentPhase = phaseRef.current;
      const currentRegions = regionsRef.current;
      const edenCount = currentRegions.filter(r => r.type === RegionType.EDEN).length;

      // State Machine
      if (currentPhase === GCPhase.IDLE) {
        if (edenCount >= MAX_EDEN_REGIONS) {
          // Trigger GC
          await performYoungGC();
        } else {
          // Normal Operation
          allocate();
        }
      } else if (currentPhase === GCPhase.CONCURRENT_MARK) {
          await performConcurrentMark();
      } else if (currentPhase === GCPhase.MIXED_GC) {
          await performMixedGC();
      }
      
      // Reschedule tick
      // We use a dynamic timeout to allow async operations (GC pauses) to finish
      // before the next tick is scheduled.
      timeoutId = setTimeout(tick, (TICK_RATE_MS / speedMultiplier));
    };

    timeoutId = setTimeout(tick, TICK_RATE_MS / speedMultiplier);

    return () => clearTimeout(timeoutId);
  }, [isRunning, speedMultiplier, allocate, performYoungGC, performConcurrentMark, performMixedGC]);

  const reset = useCallback(() => {
      setRegions(INITIAL_REGIONS);
      setStats({ allocations: 0, youngGCs: 0, mixedGCs: 0, memoryUsage: 0, avgPauseTime: 0 });
      setLogs([]);
      setPhase(GCPhase.IDLE);
      addLog("Simulation Reset", "info");
  }, [addLog]);

  return { regions, phase, stats, logs, reset };
};