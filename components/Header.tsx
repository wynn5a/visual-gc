
import React from 'react';
import { Info } from 'lucide-react';
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
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm z-20">
            <Logo />
            <div className="flex items-center space-x-6">
                <ModeSwitcher currentMode={mode} onModeChange={onModeChange} />
                <GuideButton isActive={showIntro} onClick={onToggleIntro} />
            </div>
        </header>
    );
};

const Logo: React.FC = () => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-slate-900">VM</span>
        </div>
        <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                GC Visualizer
            </h1>
            <p className="text-slate-500 text-xs hidden sm:block">Java Virtual Machine Simulation</p>
        </div>
    </div>
);

interface ModeSwitcherProps {
    currentMode: GCMode;
    onModeChange: (mode: GCMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
    return (
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <ModeButton
                mode={GCMode.G1}
                isActive={currentMode === GCMode.G1}
                activeClass="bg-slate-700 text-white shadow"
                onClick={() => onModeChange(GCMode.G1)}
            >
                G1 GC
            </ModeButton>
            <ModeButton
                mode={GCMode.ZGC}
                isActive={currentMode === GCMode.ZGC}
                activeClass="bg-indigo-600 text-white shadow"
                onClick={() => onModeChange(GCMode.ZGC)}
            >
                ZGC
            </ModeButton>
        </div>
    );
};

interface ModeButtonProps {
    mode: GCMode;
    isActive: boolean;
    activeClass: string;
    onClick: () => void;
    children: React.ReactNode;
}

const ModeButton: React.FC<ModeButtonProps> = ({
    isActive,
    activeClass,
    onClick,
    children,
}) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isActive ? activeClass : 'text-slate-500 hover:text-slate-300'
            }`}
    >
        {children}
    </button>
);

interface GuideButtonProps {
    isActive: boolean;
    onClick: () => void;
}

const GuideButton: React.FC<GuideButtonProps> = ({ isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`text-sm flex items-center gap-1 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
    >
        <Info size={16} /> Guide
    </button>
);
