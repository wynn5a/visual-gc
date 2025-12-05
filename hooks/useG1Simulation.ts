
import { useState, useEffect, useRef, useCallback } from 'react';
import { Region, RegionType, GCPhase, SimulationStats, LogEntry, GCMode } from '../types';
import { TOTAL_REGIONS, MAX_EDEN_REGIONS, OLD_GEN_THRESHOLD, MAX_AGE, TICK_RATE_MS, ZGC_HEAP_THRESHOLD } from '../constants';

const INITIAL_REGIONS: Region[] = Array.from({ length: TOTAL_REGIONS }, (_, i) => ({
  id: i,
  type: RegionType.FREE,
  usedPercentage: 0,
  livenessPercentage: 0,
  age: 0,
  isTargeted: false,
}));

export const useGCSimulation = (isRunning: boolean, speedMultiplier: number, mode: GCMode) => {
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
  
  const regionsRef = useRef(regions);
  const phaseRef = useRef(phase);
  const modeRef = useRef(mode);

  useEffect(() => { regionsRef.current = regions; }, [regions]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

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

  const allocate = useCallback((isZGC: boolean = false) => {
    const currentRegions = [...regionsRef.current];
    const freeIndices = currentRegions
      .map((r, i) => r.type === RegionType.FREE ? i : -1)
      .filter(i => i !== -1);

    if (freeIndices.length === 0) {
      addLog("Heap Full! Emergency Clear...", "error");
      setRegions(currentRegions.map(r => ({ ...r, type: RegionType.FREE, usedPercentage: 0 })));
      setPhase(GCPhase.IDLE);
      return;
    }

    const count = Math.min(Math.floor(Math.random() * 2) + 1, freeIndices.length);
    for (let k = 0; k < count; k++) {
      const idx = freeIndices[Math.floor(Math.random() * freeIndices.length)];
      const arrayIdx = freeIndices.indexOf(idx);
      if (arrayIdx > -1) freeIndices.splice(arrayIdx, 1);

      currentRegions[idx] = {
        ...currentRegions[idx],
        type: isZGC ? RegionType.Z_PAGE : RegionType.EDEN,
        usedPercentage: Math.floor(Math.random() * 40) + 60,
        livenessPercentage: Math.floor(Math.random() * 60) + 20,
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

  // --- G1 Specific Logic ---

  const performG1YoungGC = useCallback(async () => {
    setPhase(GCPhase.YOUNG_GC);
    addLog("G1 Young GC Started: STW Evacuation", "warn");
    await new Promise(r => setTimeout(r, 600));

    const currentRegions = [...regionsRef.current];
    let promoted = 0, survived = 0, reclaimed = 0;

    const newRegions = currentRegions.map(r => {
      if (r.type === RegionType.EDEN || r.type === RegionType.SURVIVOR) {
        if (Math.random() > (r.livenessPercentage / 100)) {
            reclaimed++;
            return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0, age: 0, isTargeted: false };
        }
        if (r.age >= MAX_AGE) {
          promoted++;
          return { ...r, type: RegionType.OLD, age: r.age + 1, livenessPercentage: Math.max(10, r.livenessPercentage - 10), isTargeted: false };
        } else {
          survived++;
          return { ...r, type: RegionType.SURVIVOR, age: r.age + 1, isTargeted: false };
        }
      }
      return r;
    });

    setRegions(newRegions);
    setStats(prev => ({ ...prev, youngGCs: prev.youngGCs + 1, memoryUsage: getHeapUsage(newRegions) }));
    addLog(`Young GC Done. Promoted: ${promoted}, Survived: ${survived}`, "success");

    if (getHeapUsage(newRegions) > OLD_GEN_THRESHOLD) {
        setTimeout(() => setPhase(GCPhase.CONCURRENT_MARK), 500);
    } else {
        setPhase(GCPhase.IDLE);
    }
  }, [addLog, getHeapUsage]);

  const performG1ConcurrentMark = useCallback(async () => {
    addLog("Concurrent Marking Started", "info");
    setRegions(prev => prev.map(r => r.type === RegionType.OLD ? { ...r, isTargeted: true } : r));
    await new Promise(r => setTimeout(r, 1000));
    
    setRegions(prev => prev.map(r => r.type === RegionType.OLD ? { 
        ...r, 
        isTargeted: false,
        livenessPercentage: Math.max(5, r.livenessPercentage - Math.floor(Math.random() * 20)) 
    } : r));
    
    addLog("Marking Finished", "info");
    setPhase(GCPhase.MIXED_GC);
  }, [addLog]);

  const performG1MixedGC = useCallback(async () => {
    addLog("Mixed GC Started", "warn");
    await new Promise(r => setTimeout(r, 800));

    let currentRegions = [...regionsRef.current];
    const candidateOldIndices = currentRegions
        .map((r, i) => (r.type === RegionType.OLD && r.livenessPercentage < 60) ? i : -1)
        .filter(i => i !== -1)
        .sort((a, b) => currentRegions[a].livenessPercentage - currentRegions[b].livenessPercentage)
        .slice(0, 8);

    setRegions(prev => prev.map((r, i) => candidateOldIndices.includes(i) || r.type === RegionType.EDEN || r.type === RegionType.SURVIVOR ? { ...r, isTargeted: true } : r));
    await new Promise(r => setTimeout(r, 800));

    let reclaimedOld = 0;
    currentRegions = regionsRef.current.map((r, i) => {
        if (r.type === RegionType.EDEN || r.type === RegionType.SURVIVOR) {
             if (Math.random() > (r.livenessPercentage / 100)) {
                return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0, age: 0, isTargeted: false };
            }
            return { ...r, type: r.age >= MAX_AGE ? RegionType.OLD : RegionType.SURVIVOR, age: r.age + 1, isTargeted: false };
        }
        if (candidateOldIndices.includes(i)) {
            reclaimedOld++;
            return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0, age: 0, isTargeted: false };
        }
        return { ...r, isTargeted: false };
    });

    setRegions(currentRegions);
    setStats(prev => ({ ...prev, mixedGCs: prev.mixedGCs + 1, memoryUsage: getHeapUsage(currentRegions) }));
    addLog(`Mixed GC Done. Reclaimed ${reclaimedOld} Old Regions.`, "success");
    setPhase(GCPhase.IDLE);
  }, [addLog, getHeapUsage]);

  // --- ZGC Specific Logic ---

  // ZGC Helper: Simulate processing a bit of work and concurrent allocation
  const zgcConcurrentStep = useCallback((work: () => void, probability: number) => {
    // Perform GC work
    work();
    // Allow allocation (Concurrent!)
    if (Math.random() > 0.3) allocate(true);
  }, [allocate]);

  const tickZGC = useCallback(async () => {
    const currentRegions = regionsRef.current;
    const usage = getHeapUsage(currentRegions);
    const p = phaseRef.current;

    // Trigger
    if (p === GCPhase.IDLE) {
      if (usage > ZGC_HEAP_THRESHOLD) {
        setPhase(GCPhase.ZGC_MARK_START);
      } else {
        allocate(true);
      }
      return;
    }

    // Phases
    if (p === GCPhase.ZGC_MARK_START) {
      // Pause Phase (STW)
      addLog("ZGC Pause Mark Start (STW)", "warn");
      // Flash regions
      setRegions(prev => prev.map(r => r.type === RegionType.Z_PAGE ? { ...r, isTargeted: true } : r));
      setTimeout(() => {
        setPhase(GCPhase.ZGC_CONCURRENT_MARK);
      }, 200); // Short pause
      return;
    }

    if (p === GCPhase.ZGC_CONCURRENT_MARK) {
      // Simulate scanning: randomly untarget some regions, update liveness
      // This runs over multiple ticks visually
      const stillTargeted = currentRegions.filter(r => r.isTargeted).length;
      
      if (stillTargeted > 0) {
        // Process a batch
        const newRegions = currentRegions.map(r => {
           if (r.isTargeted && Math.random() > 0.7) {
             return { 
                ...r, 
                isTargeted: false, 
                livenessPercentage: Math.max(0, r.livenessPercentage - Math.floor(Math.random() * 30)) 
             };
           }
           return r;
        });
        setRegions(newRegions);
        // Concurrent allocation
        if (Math.random() > 0.5) allocate(true); 
      } else {
        setPhase(GCPhase.ZGC_MARK_END);
      }
      return;
    }

    if (p === GCPhase.ZGC_MARK_END) {
       addLog("ZGC Pause Mark End (STW)", "warn");
       setTimeout(() => setPhase(GCPhase.ZGC_CONCURRENT_RELOCATE), 200);
       return;
    }

    if (p === GCPhase.ZGC_CONCURRENT_RELOCATE) {
       // Find candidates (fragmented pages)
       // We mark them as RELOCATING
       const relocatingCount = currentRegions.filter(r => r.type === RegionType.Z_RELOCATING).length;
       
       if (relocatingCount === 0) {
         // Identify new candidates
         const candidates = currentRegions
            .map((r, i) => (r.type === RegionType.Z_PAGE && r.livenessPercentage < 50) ? i : -1)
            .filter(i => i !== -1)
            .slice(0, 5); // Take 5 at a time
            
         if (candidates.length === 0) {
            // Done
            addLog("ZGC Cycle Complete", "success");
            setStats(prev => ({ ...prev, mixedGCs: prev.mixedGCs + 1 })); // Count as cycle
            setPhase(GCPhase.IDLE);
            return;
         }

         setRegions(prev => prev.map((r, i) => candidates.includes(i) ? { ...r, type: RegionType.Z_RELOCATING } : r));
         addLog(`ZGC Relocating ${candidates.length} pages...`, "info");
       } else {
         // Process relocation (Free them, maybe allocate new ones to simulate moving data)
         const newRegions = currentRegions.map(r => {
            if (r.type === RegionType.Z_RELOCATING) {
               // Relocate: Become Free
               if (Math.random() > 0.5) {
                   return { ...r, type: RegionType.FREE, usedPercentage: 0, livenessPercentage: 0 };
               }
            }
            return r;
         });
         setRegions(newRegions);
         // Simulate moving data -> allocate fresh pages
         if (Math.random() > 0.3) allocate(true);
       }
       return;
    }

  }, [allocate, getHeapUsage, addLog]);


  // --- Game Loop ---
  useEffect(() => {
    if (!isRunning) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (modeRef.current === GCMode.G1) {
          const currentPhase = phaseRef.current;
          const currentRegions = regionsRef.current;
          const edenCount = currentRegions.filter(r => r.type === RegionType.EDEN).length;

          if (currentPhase === GCPhase.IDLE) {
            if (edenCount >= MAX_EDEN_REGIONS) {
              await performG1YoungGC();
            } else {
              allocate();
            }
          } else if (currentPhase === GCPhase.CONCURRENT_MARK) {
              await performG1ConcurrentMark();
          } else if (currentPhase === GCPhase.MIXED_GC) {
              await performG1MixedGC();
          }
      } else {
          // ZGC Logic
          await tickZGC();
      }
      
      timeoutId = setTimeout(tick, (TICK_RATE_MS / speedMultiplier));
    };

    timeoutId = setTimeout(tick, TICK_RATE_MS / speedMultiplier);

    return () => clearTimeout(timeoutId);
  }, [isRunning, speedMultiplier, performG1YoungGC, performG1ConcurrentMark, performG1MixedGC, allocate, tickZGC]);

  const reset = useCallback(() => {
      setRegions(INITIAL_REGIONS);
      setStats({ allocations: 0, youngGCs: 0, mixedGCs: 0, memoryUsage: 0, avgPauseTime: 0 });
      setLogs([]);
      setPhase(GCPhase.IDLE);
      addLog("Simulation Reset", "info");
  }, [addLog]);

  return { regions, phase, stats, logs, reset };
};
