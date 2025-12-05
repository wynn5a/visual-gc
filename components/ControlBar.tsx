
import React from 'react';
import { Play, Pause, RotateCcw, Gauge, HelpCircle } from 'lucide-react';

interface ControlBarProps {
    isRunning: boolean;
    speed: number;
    onToggleRunning: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [
    { value: 0.5, label: '0.5x', desc: 'Slow - Easy to follow' },
    { value: 1, label: '1x', desc: 'Normal speed' },
    { value: 2, label: '2x', desc: 'Fast' },
    { value: 4, label: '4x', desc: 'Very fast' },
] as const;

export const ControlBar: React.FC<ControlBarProps> = ({
    isRunning,
    speed,
    onToggleRunning,
    onReset,
    onSpeedChange,
}) => {
    return (
        <div className="shrink-0 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
            {/* Left: Play/Pause Controls */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleRunning}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg
                        ${isRunning
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20 shadow-amber-500/10'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25'
                        }
                    `}
                >
                    {isRunning ? (
                        <>
                            <Pause size={18} />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <Play size={18} />
                            <span>Start Simulation</span>
                        </>
                    )}
                </button>

                <button
                    onClick={onReset}
                    className="group flex items-center gap-2 p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 hover:border-slate-700"
                    title="Reset Simulation"
                >
                    <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
                    <span className="text-sm hidden sm:inline">Reset</span>
                </button>
            </div>

            {/* Center: Quick Tips */}
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs">
                <HelpCircle size={12} />
                <span>Hover on regions for details</span>
            </div>

            {/* Right: Speed Control */}
            <SpeedSelector currentSpeed={speed} onSpeedChange={onSpeedChange} />
        </div>
    );
};

interface SpeedSelectorProps {
    currentSpeed: number;
    onSpeedChange: (speed: number) => void;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({ currentSpeed, onSpeedChange }) => {
    const currentOption = SPEED_OPTIONS.find(s => s.value === currentSpeed);

    return (
        <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 px-2">
                <Gauge size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Speed</span>
            </div>

            <div className="flex gap-1">
                {SPEED_OPTIONS.map(s => (
                    <button
                        key={s.value}
                        onClick={() => onSpeedChange(s.value)}
                        className={`group relative px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${currentSpeed === s.value
                                ? 'bg-slate-700 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        {s.label}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {s.desc}
                        </div>
                    </button>
                ))}
            </div>

            {/* Current speed indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 text-[10px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></span>
                {currentOption?.desc || 'Normal'}
            </div>
        </div>
    );
};
