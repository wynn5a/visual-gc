
import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ControlBarProps {
    isRunning: boolean;
    speed: number;
    onToggleRunning: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

export const ControlBar: React.FC<ControlBarProps> = ({
    isRunning,
    speed,
    onToggleRunning,
    onReset,
    onSpeedChange,
}) => {
    return (
        <div className="shrink-0 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleRunning}
                    className={`
            flex items-center gap-2 px-5 py-2 rounded-md font-bold transition-all shadow-lg
            ${isRunning
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'}
          `}
                >
                    {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Run</>}
                </button>

                <button
                    onClick={onReset}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
                    title="Reset Simulation"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            <SpeedSelector currentSpeed={speed} onSpeedChange={onSpeedChange} />
        </div>
    );
};

interface SpeedSelectorProps {
    currentSpeed: number;
    onSpeedChange: (speed: number) => void;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({ currentSpeed, onSpeedChange }) => {
    return (
        <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-500 font-mono uppercase px-2">Speed</span>
            <div className="flex gap-1">
                {SPEED_OPTIONS.map(s => (
                    <button
                        key={s}
                        onClick={() => onSpeedChange(s)}
                        className={`w-8 h-6 text-xs rounded font-medium transition-colors ${currentSpeed === s
                                ? 'bg-slate-700 text-white shadow'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    );
};
