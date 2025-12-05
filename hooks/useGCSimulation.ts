
import { useState, useEffect, useRef, useCallback } from 'react';
import { Region, RegionType, GCPhase, SimulationStats, LogEntry, GCMode } from '../types';
import { TOTAL_REGIONS, G1_CONFIG, TICK_RATE_MS } from '../constants';
import { createInitialRegions, getFreeRegionIndices, getHeapUsage } from '../utils/regionUtils';
import { createLogEntry, LOG_MESSAGES } from '../utils/logUtils';
import { useG1GC } from './useG1GC';
import { useZGC } from './useZGC';

const MAX_LOG_ENTRIES = 50;

const INITIAL_STATS: SimulationStats = {
    allocations: 0,
    youngGCs: 0,
    mixedGCs: 0,
    memoryUsage: 0,
    avgPauseTime: 0,
};

/**
 * Main GC simulation hook that orchestrates G1 and ZGC behavior
 */
export const useGCSimulation = (isRunning: boolean, speedMultiplier: number, mode: GCMode) => {
    const [regions, setRegions] = useState<Region[]>(createInitialRegions);
    const [phase, setPhase] = useState<GCPhase>(GCPhase.IDLE);
    const [stats, setStats] = useState<SimulationStats>(INITIAL_STATS);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Refs for accessing current state in callbacks without dependencies
    const regionsRef = useRef(regions);
    const phaseRef = useRef(phase);
    const modeRef = useRef(mode);

    // Keep refs in sync with state
    useEffect(() => { regionsRef.current = regions; }, [regions]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    /**
     * Adds a log entry to the simulation log
     */
    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        const entry = createLogEntry(message, type);
        setLogs(prev => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
    }, []);

    /**
     * Allocates new objects to the heap
     */
    const allocate = useCallback((isZGC: boolean = false) => {
        const currentRegions = [...regionsRef.current];
        const freeIndices = getFreeRegionIndices(currentRegions);

        // Handle heap full condition
        if (freeIndices.length === 0) {
            addLog(LOG_MESSAGES.HEAP_FULL, 'error');
            setRegions(currentRegions.map(r => ({
                ...r,
                type: RegionType.FREE,
                usedPercentage: 0
            })));
            setPhase(GCPhase.IDLE);
            return;
        }

        // Humongous allocation chance (G1 only)
        const isHumongous = !isZGC && Math.random() < G1_CONFIG.HUMONGOUS_CHANCE;

        // Allocate 1-2 regions
        const count = Math.min(Math.floor(Math.random() * 2) + 1, freeIndices.length);
        const indicesToUse = [...freeIndices];

        for (let k = 0; k < count; k++) {
            const randomIndex = Math.floor(Math.random() * indicesToUse.length);
            const idx = indicesToUse[randomIndex];
            indicesToUse.splice(randomIndex, 1);

            const regionType = isZGC
                ? RegionType.Z_PAGE
                : (isHumongous ? RegionType.HUMONGOUS : RegionType.EDEN);

            currentRegions[idx] = {
                ...currentRegions[idx],
                type: regionType,
                usedPercentage: isHumongous ? 100 : Math.floor(Math.random() * 40) + 60,
                livenessPercentage: isHumongous ? 100 : Math.floor(Math.random() * 60) + 20,
                age: 0,
            };
        }

        setRegions(currentRegions);
        setStats(prev => ({
            ...prev,
            allocations: prev.allocations + count,
            memoryUsage: getHeapUsage(currentRegions),
        }));
    }, [addLog]);

    // Initialize G1 GC hook
    const { performYoungGC, performConcurrentMark, performMixedGC } = useG1GC({
        regionsRef,
        setRegions,
        setPhase,
        setStats,
        addLog,
    });

    // Initialize ZGC hook
    const { tickZGC } = useZGC({
        regionsRef,
        phaseRef,
        setRegions,
        setPhase,
        setStats,
        addLog,
        allocate,
    });

    /**
     * G1 GC tick handler
     */
    const tickG1 = useCallback(async () => {
        const currentPhase = phaseRef.current;
        const currentRegions = regionsRef.current;
        const edenCount = currentRegions.filter(r => r.type === RegionType.EDEN).length;

        switch (currentPhase) {
            case GCPhase.IDLE:
                if (edenCount >= G1_CONFIG.MAX_EDEN_REGIONS) {
                    await performYoungGC();
                } else {
                    allocate();
                }
                break;
            case GCPhase.CONCURRENT_MARK:
                await performConcurrentMark();
                break;
            case GCPhase.MIXED_GC:
                await performMixedGC();
                break;
        }
    }, [performYoungGC, performConcurrentMark, performMixedGC, allocate]);

    /**
     * Main simulation loop
     */
    useEffect(() => {
        if (!isRunning) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const tick = async () => {
            if (modeRef.current === GCMode.G1) {
                await tickG1();
            } else {
                await tickZGC();
            }

            timeoutId = setTimeout(tick, TICK_RATE_MS / speedMultiplier);
        };

        timeoutId = setTimeout(tick, TICK_RATE_MS / speedMultiplier);

        return () => clearTimeout(timeoutId);
    }, [isRunning, speedMultiplier, tickG1, tickZGC]);

    /**
     * Resets the simulation to initial state
     */
    const reset = useCallback(() => {
        setRegions(createInitialRegions());
        setStats(INITIAL_STATS);
        setLogs([]);
        setPhase(GCPhase.IDLE);
        addLog(LOG_MESSAGES.SIMULATION_RESET, 'info');
    }, [addLog]);

    return { regions, phase, stats, logs, reset };
};
