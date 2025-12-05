import { useCallback, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { Region, RegionType, GCPhase, SimulationStats } from '../types';
import { ZGC_CONFIG, ANIMATION_DELAYS } from '../constants';
import {
    getFreeRegionIndices,
    clearRegion,
    createRegion,
    getHeapUsage,
} from '../utils/regionUtils';
import { LOG_MESSAGES } from '../utils/logUtils';

interface UseZGCProps {
    regionsRef: MutableRefObject<Region[]>;
    phaseRef: MutableRefObject<GCPhase>;
    setRegions: Dispatch<SetStateAction<Region[]>>;
    setPhase: Dispatch<SetStateAction<GCPhase>>;
    setStats: Dispatch<SetStateAction<SimulationStats>>;
    addLog: (message: string, type?: 'info' | 'warn' | 'success' | 'error') => void;
    allocate: (isZGC?: boolean) => void;
}

/**
 * Hook containing ZGC specific logic
 */
export const useZGC = ({
    regionsRef,
    phaseRef,
    setRegions,
    setPhase,
    setStats,
    addLog,
    allocate,
}: UseZGCProps) => {
    const {
        HEAP_TRIGGER_THRESHOLD,
        LIVENESS_THRESHOLD,
        MAX_RELOCATION_PAGES,
        PAGES_TO_FREE_PER_TICK,
        MIN_LIVE_DATA_FOR_PAGE,
        CONCURRENT_ALLOC_CHANCE,
        RELOCATION_ALLOC_CHANCE,
    } = ZGC_CONFIG;

    /**
     * Processes the Mark Start phase (brief STW pause)
     */
    const handleMarkStart = useCallback(() => {
        addLog(LOG_MESSAGES.ZGC_MARK_START, 'warn');
        setRegions(prev =>
            prev.map(r => r.type === RegionType.Z_PAGE ? { ...r, isTargeted: true } : r)
        );
        setTimeout(() => setPhase(GCPhase.ZGC_CONCURRENT_MARK), ANIMATION_DELAYS.ZGC_STW_PAUSE);
    }, [addLog, setRegions, setPhase]);

    /**
     * Processes one tick of concurrent marking
     */
    const handleConcurrentMark = useCallback((regions: Region[]) => {
        const stillTargeted = regions.filter(r => r.isTargeted).length;

        if (stillTargeted > 0) {
            // Process marking - update liveness for some targeted regions
            const newRegions = regions.map(r => {
                if (r.isTargeted && Math.random() > 0.4) {
                    return {
                        ...r,
                        isTargeted: false,
                        livenessPercentage: Math.max(0, r.livenessPercentage - Math.floor(Math.random() * 40)),
                    };
                }
                return r;
            });
            setRegions(newRegions);

            // Reduced concurrent allocation
            if (Math.random() < CONCURRENT_ALLOC_CHANCE) {
                allocate(true);
            }
        } else {
            setPhase(GCPhase.ZGC_MARK_END);
        }
    }, [setRegions, setPhase, allocate, CONCURRENT_ALLOC_CHANCE]);

    /**
     * Processes the Mark End phase (brief STW pause)
     */
    const handleMarkEnd = useCallback(() => {
        addLog(LOG_MESSAGES.ZGC_MARK_END, 'warn');
        setTimeout(() => setPhase(GCPhase.ZGC_CONCURRENT_RELOCATE), ANIMATION_DELAYS.ZGC_STW_PAUSE);
    }, [addLog, setPhase]);

    /**
     * Processes concurrent relocation
     */
    const handleConcurrentRelocate = useCallback((regions: Region[]) => {
        const relocatingIndices = regions
            .map((r, i) => r.type === RegionType.Z_RELOCATING ? i : -1)
            .filter(i => i !== -1);

        const currentRegions = [...regions];

        if (relocatingIndices.length === 0) {
            // Identify candidates for relocation
            const candidates = regions
                .map((r, i) => (r.type === RegionType.Z_PAGE && r.livenessPercentage < LIVENESS_THRESHOLD) ? i : -1)
                .filter(i => i !== -1)
                .slice(0, MAX_RELOCATION_PAGES);

            if (candidates.length === 0) {
                addLog(LOG_MESSAGES.ZGC_CYCLE_COMPLETE, 'success');
                setStats(prev => ({ ...prev, mixedGCs: prev.mixedGCs + 1 }));
                setPhase(GCPhase.IDLE);
                return;
            }

            setRegions(prev =>
                prev.map((r, i) => candidates.includes(i) ? { ...r, type: RegionType.Z_RELOCATING } : r)
            );
            addLog(LOG_MESSAGES.ZGC_RELOCATING(candidates.length), 'info');
        } else {
            // Free relocating pages and compact
            const pagesToFree = Math.min(PAGES_TO_FREE_PER_TICK, relocatingIndices.length);
            let liveDataMoved = 0;

            for (let i = 0; i < pagesToFree; i++) {
                const idx = relocatingIndices[i];
                const r = currentRegions[idx];
                liveDataMoved += (r.usedPercentage * (r.livenessPercentage / 100));
                currentRegions[idx] = clearRegion(currentRegions[idx]);
            }

            // Create a new compacted page if enough live data
            if (liveDataMoved > MIN_LIVE_DATA_FOR_PAGE) {
                const freeIndices = getFreeRegionIndices(currentRegions);
                if (freeIndices.length > 0) {
                    const destIdx = freeIndices[0];
                    currentRegions[destIdx] = createRegion(currentRegions[destIdx], RegionType.Z_PAGE, 90, 100, 0);
                }
            }

            setRegions(currentRegions);
            setStats(prev => ({ ...prev, memoryUsage: getHeapUsage(currentRegions) }));

            // Very low allocation during relocation
            if (Math.random() < RELOCATION_ALLOC_CHANCE) {
                allocate(true);
            }
        }
    }, [addLog, setRegions, setPhase, setStats, allocate, LIVENESS_THRESHOLD, MAX_RELOCATION_PAGES, PAGES_TO_FREE_PER_TICK, MIN_LIVE_DATA_FOR_PAGE, RELOCATION_ALLOC_CHANCE]);

    /**
     * Main ZGC tick handler - processes one step of the ZGC cycle
     */
    const tickZGC = useCallback(async () => {
        const currentRegions = regionsRef.current;
        const usage = getHeapUsage(currentRegions);
        const currentPhase = phaseRef.current;

        // Check if we should start a ZGC cycle
        if (currentPhase === GCPhase.IDLE) {
            if (usage > HEAP_TRIGGER_THRESHOLD) {
                setPhase(GCPhase.ZGC_MARK_START);
            } else {
                allocate(true);
            }
            return;
        }

        // Handle each ZGC phase
        switch (currentPhase) {
            case GCPhase.ZGC_MARK_START:
                handleMarkStart();
                break;
            case GCPhase.ZGC_CONCURRENT_MARK:
                handleConcurrentMark(currentRegions);
                break;
            case GCPhase.ZGC_MARK_END:
                handleMarkEnd();
                break;
            case GCPhase.ZGC_CONCURRENT_RELOCATE:
                handleConcurrentRelocate(currentRegions);
                break;
        }
    }, [
        regionsRef,
        phaseRef,
        allocate,
        handleMarkStart,
        handleConcurrentMark,
        handleMarkEnd,
        handleConcurrentRelocate,
        HEAP_TRIGGER_THRESHOLD,
        setPhase,
    ]);

    return { tickZGC };
};
