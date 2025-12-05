import { useCallback, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { Region, RegionType, GCPhase, SimulationStats } from '../types';
import { G1_CONFIG, ANIMATION_DELAYS } from '../constants';
import {
    getFreeRegionIndices,
    getRegionIndicesByTypes,
    clearRegion,
    createRegion,
    calculateSurvivingData,
    calculateRegionsNeeded,
    setRegionsTargeted,
    getHeapUsage,
} from '../utils/regionUtils';
import { LOG_MESSAGES } from '../utils/logUtils';

interface UseG1GCProps {
    regionsRef: MutableRefObject<Region[]>;
    setRegions: Dispatch<SetStateAction<Region[]>>;
    setPhase: Dispatch<SetStateAction<GCPhase>>;
    setStats: Dispatch<SetStateAction<SimulationStats>>;
    addLog: (message: string, type?: 'info' | 'warn' | 'success' | 'error') => void;
}

/**
 * Hook containing G1 GC specific logic
 */
export const useG1GC = ({
    regionsRef,
    setRegions,
    setPhase,
    setStats,
    addLog,
}: UseG1GCProps) => {
    const { TARGET_FILL_RATE, MAX_AGE, MIXED_GC_LIVENESS_THRESHOLD, MIXED_GC_MAX_CSET_SIZE } = G1_CONFIG;

    /**
     * Evacuates regions from Collection Set to Survivor and Old regions
     * Returns the count of survivor and old regions created
     */
    const evacuateRegions = useCallback((
        regions: Region[],
        csetIndices: number[],
    ): { newRegions: Region[]; survivorCount: number; oldCount: number; success: boolean } => {
        // Track surviving data by destination and age
        let totalToOld = 0;
        const survivorByAge: { amount: number; age: number }[] = [];

        // Calculate live data volumes and track ages
        csetIndices.forEach(i => {
            const r = regions[i];
            const survivingAmount = calculateSurvivingData(r);

            if (survivingAmount > 0) {
                if (r.type === RegionType.OLD) {
                    // Old regions stay in Old
                    totalToOld += survivingAmount;
                } else {
                    // Eden or Survivor - check if should promote
                    const newAge = r.age + 1;
                    if (newAge >= MAX_AGE) {
                        // Promote to Old
                        totalToOld += survivingAmount;
                    } else {
                        // Stay in Survivor with incremented age
                        survivorByAge.push({ amount: survivingAmount, age: newAge });
                    }
                }
            }
        });

        const totalToSurvivor = survivorByAge.reduce((sum, s) => sum + s.amount, 0);
        const survivorRegionsNeeded = calculateRegionsNeeded(totalToSurvivor, TARGET_FILL_RATE);
        const oldRegionsNeeded = calculateRegionsNeeded(totalToOld, TARGET_FILL_RATE);
        const freeIndices = getFreeRegionIndices(regions);

        // Check for evacuation failure
        if (freeIndices.length < (survivorRegionsNeeded + oldRegionsNeeded)) {
            return { newRegions: regions, survivorCount: 0, oldCount: 0, success: false };
        }

        // Clone regions for modification
        const newRegions = [...regions];

        // Clear CSet regions
        csetIndices.forEach(i => {
            newRegions[i] = clearRegion(newRegions[i]);
        });

        let freePtr = 0;

        // Allocate Survivor regions with proper ages
        // Use average age of surviving data for simplicity
        const avgSurvivorAge = survivorByAge.length > 0
            ? Math.round(survivorByAge.reduce((sum, s) => sum + s.age * s.amount, 0) / totalToSurvivor)
            : 1;

        for (let k = 0; k < survivorRegionsNeeded; k++) {
            const idx = freeIndices[freePtr++];
            const isLastRegion = k === survivorRegionsNeeded - 1;
            const fill = (isLastRegion && (totalToSurvivor % TARGET_FILL_RATE > 0))
                ? (totalToSurvivor % TARGET_FILL_RATE)
                : TARGET_FILL_RATE;

            newRegions[idx] = createRegion(newRegions[idx], RegionType.SURVIVOR, fill, 90, avgSurvivorAge);
        }

        // Allocate Old regions
        for (let k = 0; k < oldRegionsNeeded; k++) {
            const idx = freeIndices[freePtr++];
            const isLastRegion = k === oldRegionsNeeded - 1;
            const fill = (isLastRegion && (totalToOld % TARGET_FILL_RATE > 0))
                ? (totalToOld % TARGET_FILL_RATE)
                : TARGET_FILL_RATE;

            newRegions[idx] = createRegion(newRegions[idx], RegionType.OLD, fill, 90, MAX_AGE + 1);
        }

        return {
            newRegions,
            survivorCount: survivorRegionsNeeded,
            oldCount: oldRegionsNeeded,
            success: true,
        };
    }, [MAX_AGE, TARGET_FILL_RATE]);

    /**
     * Handles evacuation failure by resetting the heap
     */
    const handleEvacuationFailure = useCallback((
        regions: Region[],
        errorMessage: string
    ): Region[] => {
        addLog(errorMessage, 'error');
        // Keep a few old regions for visual continuity
        return regions.map((r, i) => ({
            ...r,
            type: i < 5 ? RegionType.OLD : RegionType.FREE,
            usedPercentage: i < 5 ? 50 : 0,
            livenessPercentage: i < 5 ? 100 : 0,
            age: i < 5 ? MAX_AGE : 0,
            isTargeted: false,
        }));
    }, [addLog, MAX_AGE]);

    /**
     * Performs a Young GC (Stop-The-World evacuation of Eden and Survivor regions)
     */
    const performYoungGC = useCallback(async () => {
        setPhase(GCPhase.YOUNG_GC);
        addLog(LOG_MESSAGES.G1_YOUNG_GC_START, 'warn');
        await new Promise(r => setTimeout(r, ANIMATION_DELAYS.YOUNG_GC_START));

        // Identify Collection Set: All Eden + All Survivor
        const csetIndices = getRegionIndicesByTypes(
            regionsRef.current,
            [RegionType.EDEN, RegionType.SURVIVOR]
        );

        if (csetIndices.length === 0) {
            setPhase(GCPhase.IDLE);
            return;
        }

        // Highlight CSet
        setRegions(prev => setRegionsTargeted(prev, csetIndices, true));
        await new Promise(r => setTimeout(r, ANIMATION_DELAYS.YOUNG_GC_HIGHLIGHT));

        // Perform evacuation
        const { newRegions, survivorCount, oldCount, success } = evacuateRegions(
            regionsRef.current,
            csetIndices
        );

        if (!success) {
            const resetRegions = handleEvacuationFailure(
                regionsRef.current,
                LOG_MESSAGES.EVACUATION_FAILURE
            );
            setRegions(resetRegions);
            setPhase(GCPhase.IDLE);
            return;
        }

        setRegions(newRegions);
        const newUsage = getHeapUsage(newRegions);

        setStats(prev => ({
            ...prev,
            youngGCs: prev.youngGCs + 1,
            memoryUsage: newUsage,
        }));

        addLog(LOG_MESSAGES.G1_YOUNG_GC_DONE(survivorCount, oldCount), 'success');

        // Check IHOP threshold for Concurrent Mark
        if (newUsage > G1_CONFIG.OLD_GEN_THRESHOLD) {
            setTimeout(() => setPhase(GCPhase.CONCURRENT_MARK), 500);
        } else {
            setPhase(GCPhase.IDLE);
        }
    }, [addLog, setPhase, setRegions, setStats, regionsRef, evacuateRegions, handleEvacuationFailure]);

    /**
     * Performs Concurrent Marking phase
     */
    const performConcurrentMark = useCallback(async () => {
        addLog(LOG_MESSAGES.G1_CONCURRENT_MARK_START, 'info');

        // Highlight Old regions during marking
        setRegions(prev =>
            prev.map(r => r.type === RegionType.OLD ? { ...r, isTargeted: true } : r)
        );

        await new Promise(r => setTimeout(r, ANIMATION_DELAYS.CONCURRENT_MARK));

        // Update liveness to simulate garbage identification
        setRegions(prev =>
            prev.map(r => r.type === RegionType.OLD ? {
                ...r,
                isTargeted: false,
                // More aggressive liveness reduction to ensure Mixed GC candidates
                livenessPercentage: Math.max(10, r.livenessPercentage - 30 - Math.floor(Math.random() * 30)),
            } : r)
        );

        addLog(LOG_MESSAGES.G1_CONCURRENT_MARK_DONE, 'info');
        setPhase(GCPhase.MIXED_GC);
    }, [addLog, setRegions, setPhase]);

    /**
     * Performs a Mixed GC (Young + candidate Old regions)
     */
    const performMixedGC = useCallback(async () => {
        addLog(LOG_MESSAGES.G1_MIXED_GC_START, 'warn');
        await new Promise(r => setTimeout(r, ANIMATION_DELAYS.MIXED_GC_START));

        const currentRegions = regionsRef.current;

        // Identify candidate Old regions with low liveness
        const candidateOldIndices = currentRegions
            .map((r, i) => (r.type === RegionType.OLD && r.livenessPercentage < MIXED_GC_LIVENESS_THRESHOLD) ? i : -1)
            .filter(i => i !== -1)
            .sort((a, b) => currentRegions[a].livenessPercentage - currentRegions[b].livenessPercentage)
            .slice(0, MIXED_GC_MAX_CSET_SIZE);

        if (candidateOldIndices.length === 0) {
            addLog(LOG_MESSAGES.G1_NO_CANDIDATES, 'info');
            setPhase(GCPhase.IDLE);
            return;
        }

        addLog(LOG_MESSAGES.G1_MIXED_GC_REGIONS(candidateOldIndices.length), 'info');

        // Build full CSet (Young + candidate Old)
        const youngIndices = getRegionIndicesByTypes(currentRegions, [RegionType.EDEN, RegionType.SURVIVOR]);
        const csetIndices = [...youngIndices, ...candidateOldIndices];

        // Highlight CSet
        setRegions(prev => setRegionsTargeted(prev, csetIndices, true));
        await new Promise(r => setTimeout(r, ANIMATION_DELAYS.MIXED_GC_HIGHLIGHT));

        // Perform evacuation
        const { newRegions, success } = evacuateRegions(regionsRef.current, csetIndices);

        if (!success) {
            addLog(LOG_MESSAGES.MIXED_GC_FAILURE, 'error');
            setRegions(regionsRef.current.map(r => ({ ...r, type: RegionType.FREE, usedPercentage: 0 })));
            setPhase(GCPhase.IDLE);
            return;
        }

        setRegions(newRegions);
        setStats(prev => ({
            ...prev,
            mixedGCs: prev.mixedGCs + 1,
            memoryUsage: getHeapUsage(newRegions),
        }));

        addLog(LOG_MESSAGES.G1_MIXED_GC_DONE, 'success');
        setPhase(GCPhase.IDLE);
    }, [addLog, setPhase, setRegions, setStats, regionsRef, evacuateRegions, MIXED_GC_LIVENESS_THRESHOLD, MIXED_GC_MAX_CSET_SIZE]);

    return {
        performYoungGC,
        performConcurrentMark,
        performMixedGC,
    };
};
