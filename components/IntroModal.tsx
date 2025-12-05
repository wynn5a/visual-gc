
import React from 'react';
import { X } from 'lucide-react';
import { GCMode } from '../types';

interface IntroModalProps {
    mode: GCMode;
    onClose: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ mode, onClose }) => {
    return (
        <div className="absolute top-20 right-6 z-50 w-80 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-4 shadow-2xl text-sm text-slate-300">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white">How it works</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            {mode === GCMode.G1 ? <G1Guide /> : <ZGCGuide />}
        </div>
    );
};

const G1Guide: React.FC = () => (
    <div className="space-y-3">
        <GuideSection
            title="1. Eden Allocation"
            color="text-emerald-400"
            description={
                <>Objects spawn in <span className="text-emerald-400">Green</span> regions. When full, Stop-The-World Young GC begins.</>
            }
        />
        <GuideSection
            title="2. Young GC"
            color="text-cyan-400"
            description={
                <>Live objects move to <span className="text-cyan-400">Survivor</span>. Aged objects promote to <span className="text-amber-500">Old</span>.</>
            }
        />
        <GuideSection
            title="3. Mixed GC"
            color="text-amber-500"
            description={
                <>After Concurrent Marking, collects Young + candidate <span className="text-amber-500">Old</span> regions.</>
            }
        />
        <GuideSection
            title="4. Humongous"
            color="text-purple-400"
            description={
                <>Large objects (&gt;50% region) allocate directly to <span className="text-purple-400">Humongous</span> regions.</>
            }
        />
    </div>
);

const ZGCGuide: React.FC = () => (
    <div className="space-y-3">
        <GuideSection
            title="Low Latency ZGC"
            color="text-indigo-400"
            description={
                <>ZGC performs expensive work <span className="text-white font-bold">concurrently</span> without stopping allocations.</>
            }
        />
        <GuideSection
            title="1. Marking"
            color="text-rose-400"
            description="Scans heap to find live objects. Only very brief pauses (STW) at start/end."
        />
        <GuideSection
            title="2. Relocation"
            color="text-indigo-400"
            description="Moves live objects to new pages to compact memory. Happens while your app continues to run (allocate)."
        />
    </div>
);

interface GuideSectionProps {
    title: string;
    color: string;
    description: React.ReactNode;
}

const GuideSection: React.FC<GuideSectionProps> = ({ title, color, description }) => (
    <div>
        <strong className={`${color} block text-xs uppercase tracking-wider`}>{title}</strong>
        <p className="text-xs">{description}</p>
    </div>
);
