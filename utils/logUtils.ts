
import { LogEntry } from '../types';

const MAX_LOG_ENTRIES = 50;

/**
 * Creates a new log entry
 */
export const createLogEntry = (
    message: string,
    type: LogEntry['type'] = 'info'
): LogEntry => ({
    id: Date.now() + Math.random(),
    message,
    type,
    timestamp: new Date().toLocaleTimeString(),
});

/**
 * Adds a new log entry to the log array, maintaining max size
 */
export const addLogEntry = (
    logs: LogEntry[],
    message: string,
    type: LogEntry['type'] = 'info'
): LogEntry[] => {
    const entry = createLogEntry(message, type);
    return [entry, ...logs].slice(0, MAX_LOG_ENTRIES);
};

/**
 * Log message templates for consistent messaging
 */
export const LOG_MESSAGES = {
    // G1 Messages
    G1_YOUNG_GC_START: 'G1 Young GC Started: STW Evacuation',
    G1_YOUNG_GC_DONE: (survivor: number, old: number) =>
        `Young GC Done. Evacuated: ${survivor} Survivor, ${old} Old regions.`,
    G1_CONCURRENT_MARK_START: 'Concurrent Marking Started (Snapshot-At-The-Beginning)',
    G1_CONCURRENT_MARK_DONE: 'Marking Finished. Candidate Regions Identified.',
    G1_MIXED_GC_START: 'Mixed GC Started (Young + Candidate Old)',
    G1_MIXED_GC_REGIONS: (count: number) => `Collecting ${count} Old Regions + Young Gen`,
    G1_MIXED_GC_DONE: 'Mixed GC Done. Compacted heap.',
    G1_NO_CANDIDATES: 'No viable Mixed GC candidates. Skipping to Young.',

    // ZGC Messages
    ZGC_MARK_START: 'ZGC Pause Mark Start (STW)',
    ZGC_MARK_END: 'ZGC Pause Mark End (STW)',
    ZGC_CYCLE_COMPLETE: 'ZGC Cycle Complete',
    ZGC_RELOCATING: (count: number) => `ZGC Relocating ${count} pages...`,

    // Error Messages
    HEAP_FULL: 'Heap Full! Emergency Clear...',
    EVACUATION_FAILURE: 'Evacuation Failure! To-Space Exhausted. Full GC Triggered.',
    MIXED_GC_FAILURE: 'Mixed GC Evacuation Failure! Full GC Triggered.',

    // General Messages
    SIMULATION_RESET: 'Simulation Reset',
} as const;
