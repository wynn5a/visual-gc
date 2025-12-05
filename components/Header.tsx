
import React from 'react';
import { Info, Box, Zap, Github } from 'lucide-react';
import { GCMode } from '../types';

interface HeaderProps {
    mode: GCMode;
    showIntro: boolean;
    onModeChange: (mode: GCMode) => void;
    onToggleIntro: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    mode,
    showIntro,
    onModeChange,
    onToggleIntro,
}) => {
    return (
        <header className="h-14 md:h-16 shrink-0 flex items-center justify-between px-3 md:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-20">
            <Logo />
            <div className="flex items-center space-x-2 md:space-x-6">
                <ModeSwitcher currentMode={mode} onModeChange={onModeChange} />
                <GuideButton isActive={showIntro} onClick={onToggleIntro} />
            </div>
        </header>
    );
};

const Logo: React.FC = () => (
    <div className="flex items-center gap-2 md:gap-3">
        <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
            <span className="font-black text-slate-900 text-xs md:text-sm">GC</span>
        </div>
        <div>
            <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent leading-none">
                GC Visualizer
            </h1>
            <p className="text-slate-500 text-xs hidden sm:block">Interactive JVM Memory Simulation</p>
        </div>
    </div>
);

interface ModeSwitcherProps {
    currentMode: GCMode;
    onModeChange: (mode: GCMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
    return (
        <div className="flex bg-slate-900/80 rounded-xl p-1 border border-slate-800 shadow-inner">
            <ModeButton
                mode={GCMode.G1}
                isActive={currentMode === GCMode.G1}
                onClick={() => onModeChange(GCMode.G1)}
                icon={<Box size={14} />}
                label="G1 GC"
                subtitle="Generational"
                activeGradient="from-emerald-600 to-cyan-600"
            />
            <ModeButton
                mode={GCMode.ZGC}
                isActive={currentMode === GCMode.ZGC}
                onClick={() => onModeChange(GCMode.ZGC)}
                icon={<Zap size={14} />}
                label="ZGC"
                subtitle="Low Latency"
                activeGradient="from-indigo-600 to-purple-600"
            />
        </div>
    );
};

interface ModeButtonProps {
    mode: GCMode;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    subtitle: string;
    activeGradient: string;
}

const ModeButton: React.FC<ModeButtonProps> = ({
    isActive,
    onClick,
    icon,
    label,
    subtitle,
    activeGradient,
}) => (
    <button
        onClick={onClick}
        className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 md:gap-2 ${isActive
            ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg`
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
    >
        {icon}
        <div className="text-left">
            <span className="font-bold text-xs md:text-sm block leading-tight">{label}</span>
            <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-slate-600'} hidden sm:block`}>
                {subtitle}
            </span>
        </div>
    </button>
);

interface GuideButtonProps {
    isActive: boolean;
    onClick: () => void;
}

const GuideButton: React.FC<GuideButtonProps> = ({ isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
    >
        <Info size={16} />
        <span className="text-sm font-medium hidden sm:inline">
            {isActive ? 'Close Guide' : 'Learn'}
        </span>
    </button>
);
