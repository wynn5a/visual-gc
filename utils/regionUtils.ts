
import { Region, RegionType } from '../types';
import { TOTAL_REGIONS } from '../constants';

/**
 * Creates an initial region with default values
 */
export const createEmptyRegion = (id: number): Region => ({
    id,
    type: RegionType.FREE,
    usedPercentage: 0,
    livenessPercentage: 0,
    age: 0,
    isTargeted: false,
});

/**
 * Creates the initial heap state with all free regions
 */
export const createInitialRegions = (): Region[] =>
    Array.from({ length: TOTAL_REGIONS }, (_, i) => createEmptyRegion(i));

/**
 * Calculates heap usage as a percentage
 */
export const getHeapUsage = (regions: Region[]): number => {
    const usedCount = regions.filter(r => r.type !== RegionType.FREE).length;
    return (usedCount / TOTAL_REGIONS) * 100;
};

/**
 * Gets indices of free regions
 */
export const getFreeRegionIndices = (regions: Region[]): number[] =>
    regions
        .map((r, i) => r.type === RegionType.FREE ? i : -1)
        .filter(i => i !== -1);

/**
 * Gets indices of regions matching specified types
 */
export const getRegionIndicesByTypes = (regions: Region[], types: RegionType[]): number[] =>
    regions
        .map((r, i) => types.includes(r.type) ? i : -1)
        .filter(i => i !== -1);

/**
 * Clears a region back to free state
 */
export const clearRegion = (region: Region): Region => ({
    ...region,
    type: RegionType.FREE,
    usedPercentage: 0,
    livenessPercentage: 0,
    age: 0,
    isTargeted: false,
});

/**
 * Sets targeted state on specified region indices
 */
export const setRegionsTargeted = (
    regions: Region[],
    targetIndices: number[],
    isTargeted: boolean
): Region[] =>
    regions.map((r, i) =>
        targetIndices.includes(i) ? { ...r, isTargeted } : r
    );

/**
 * Creates a new region with specific properties
 */
export const createRegion = (
    baseRegion: Region,
    type: RegionType,
    usedPercentage: number,
    livenessPercentage: number,
    age: number = 0
): Region => ({
    ...baseRegion,
    type,
    usedPercentage,
    livenessPercentage,
    age,
    isTargeted: false,
});

/**
 * Calculates surviving data amount based on liveness
 */
export const calculateSurvivingData = (region: Region): number =>
    region.usedPercentage * (region.livenessPercentage / 100);

/**
 * Calculates how many regions are needed to hold the given data amount
 */
export const calculateRegionsNeeded = (dataAmount: number, targetFillRate: number): number =>
    Math.ceil(dataAmount / targetFillRate);
