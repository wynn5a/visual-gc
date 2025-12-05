
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Box, ArrowRight, Zap, Clock, Layers, RefreshCw, Trash2, MoveRight, AlertCircle, CheckCircle } from 'lucide-react';
import { GCMode } from '../types';

interface IntroModalProps {
    mode: GCMode;
    onClose: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ mode, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = mode === GCMode.G1 ? g1Steps : zgcSteps;
    const totalSteps = steps.length;

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 md:absolute md:inset-auto md:top-20 md:right-6 w-full md:w-[420px] max-h-[85vh] md:max-h-none bg-gradient-to-br from-slate-900/98 to-slate-950/98 backdrop-blur-xl border border-slate-700/50 rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="relative px-5 py-4 border-b border-slate-800/50 bg-gradient-to-r from-slate-800/30 to-transparent">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${mode === GCMode.G1 ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}>
                            {mode === GCMode.G1 ? (
                                <Layers className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Zap className="w-5 h-5 text-indigo-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">
                                {mode === GCMode.G1 ? 'G1 Garbage Collector' : 'Z Garbage Collector'}
                            </h3>
                            <p className="text-slate-400 text-xs">
                                {mode === GCMode.G1 ? 'Generational, Region-Based GC' : 'Ultra-Low Latency GC'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress indicator */}
                <div className="flex gap-1.5 mt-4">
                    {steps.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentStep(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep
                                ? `flex-1 ${mode === GCMode.G1 ? 'bg-emerald-500' : 'bg-indigo-500'}`
                                : idx < currentStep
                                    ? `w-6 ${mode === GCMode.G1 ? 'bg-emerald-500/50' : 'bg-indigo-500/50'}`
                                    : 'w-6 bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-5 min-h-[280px] md:min-h-[340px] max-h-[50vh] md:max-h-none overflow-y-auto">
                {steps[currentStep]}
            </div>

            {/* Footer Navigation */}
            <div className="px-4 md:px-5 py-3 md:py-4 border-t border-slate-800/50 bg-slate-900/50 flex justify-between items-center">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentStep === 0
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                >
                    <ChevronLeft size={16} />
                    Back
                </button>

                <span className="text-slate-500 text-sm">
                    {currentStep + 1} / {totalSteps}
                </span>

                {currentStep < totalSteps - 1 ? (
                    <button
                        onClick={nextStep}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === GCMode.G1
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === GCMode.G1
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                    >
                        <Play size={14} />
                        Start Simulation
                    </button>
                )}
            </div>
        </div>
    );
};

// ================================
// G1 GC Tutorial Steps
// ================================
const g1Steps: React.ReactNode[] = [
    // Step 1: What is Garbage Collection?
    <div key="g1-step-0" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-emerald-400" />
            What is Garbage Collection?
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            When your Java program creates objects, they use <span className="text-emerald-400 font-medium">memory (heap)</span>.
            Over time, some objects are no longer needed – they become <span className="text-red-400 font-medium">garbage</span>.
        </p>

        {/* Visual Diagram */}
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 space-y-2">
                    <div className="flex gap-1">
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">B</div>
                        <div className="w-8 h-8 rounded bg-red-500/50 border border-dashed border-red-400 flex items-center justify-center text-xs font-bold text-red-300">C</div>
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">D</div>
                    </div>
                    <p className="text-xs text-slate-400">Objects in memory (C is garbage)</p>
                </div>
                <ArrowRight className="text-slate-600 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex gap-1">
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">B</div>
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">D</div>
                        <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600"></div>
                    </div>
                    <p className="text-xs text-slate-400">After GC (C removed, space freed)</p>
                </div>
            </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-200/80 text-xs">
                <strong>The Problem:</strong> Finding and removing garbage takes time and may pause your app temporarily.
            </p>
        </div>
    </div>,

    // Step 2: G1's Approach - Regions
    <div key="g1-step-1" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-400" />
            G1's Approach: Divide Into Regions
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            G1 divides the heap into <span className="text-emerald-400 font-medium">equally-sized regions</span>.
            Instead of collecting the entire heap, G1 can pick <span className="text-cyan-400 font-medium">specific regions</span> to clean.
        </p>

        {/* Region Grid Visual */}
        <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="grid grid-cols-6 gap-1 mb-3">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${i < 4 ? 'bg-emerald-500 text-white' :
                            i === 4 || i === 5 ? 'bg-cyan-500 text-white' :
                                i >= 10 && i <= 13 ? 'bg-amber-600 text-white' :
                                    'bg-slate-700 border border-slate-600'
                            }`}
                    >
                        {i < 4 ? 'E' : i === 4 || i === 5 ? 'S' : i >= 10 && i <= 13 ? 'O' : ''}
                    </div>
                ))}
            </div>
            <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div> Eden</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-cyan-500"></div> Survivor</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-600"></div> Old</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-700 border border-slate-600"></div> Free</span>
            </div>
        </div>

        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-emerald-200/80 text-xs">
                <strong>Benefit:</strong> G1 can clean only the "dirtiest" regions, keeping pauses short and predictable.
            </p>
        </div>
    </div>,

    // Step 3: Generational Concept
    <div key="g1-step-2" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            Generational Hypothesis
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            Most objects <span className="text-red-400 font-medium">"die young"</span> – they're created, used briefly, and become garbage.
            Only a few live long. G1 uses this knowledge with <span className="text-emerald-400 font-medium">generations</span>:
        </p>

        <div className="space-y-2">
            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                    <div className="w-4 h-4 rounded bg-emerald-500"></div>
                </div>
                <div className="flex-1">
                    <p className="text-emerald-400 font-medium text-sm">Eden (Young)</p>
                    <p className="text-slate-400 text-xs">New objects start here. Most die quickly.</p>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <span>Survivors</span>
                    <MoveRight className="w-3 h-3" />
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                    <div className="w-4 h-4 rounded bg-cyan-500"></div>
                </div>
                <div className="flex-1">
                    <p className="text-cyan-400 font-medium text-sm">Survivor (Young)</p>
                    <p className="text-slate-400 text-xs">Objects that survive Eden collection go here for observation.</p>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <span>After {'>'}3 survivals</span>
                    <MoveRight className="w-3 h-3" />
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                    <div className="w-4 h-4 rounded bg-amber-600"></div>
                </div>
                <div className="flex-1">
                    <p className="text-amber-400 font-medium text-sm">Old (Tenured)</p>
                    <p className="text-slate-400 text-xs">Long-lived objects that survived multiple GCs.</p>
                </div>
            </div>
        </div>
    </div>,

    // Step 4: Young GC Process
    <div key="g1-step-3" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Young GC (Minor Collection)
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            When Eden fills up, G1 triggers a <span className="text-cyan-400 font-medium">Young GC</span>.
            Your app <span className="text-red-400 font-medium">pauses briefly</span> (Stop-The-World) while G1 works.
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-medium">STW</span>
                Stop-The-World Pause
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-8">1.</span>
                    <div className="flex-1 bg-slate-700/50 rounded p-2 text-xs">
                        <span className="text-slate-300">Mark live objects in </span>
                        <span className="text-emerald-400">Eden</span>
                        <span className="text-slate-300"> & </span>
                        <span className="text-cyan-400">Survivor</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-8">2.</span>
                    <div className="flex-1 bg-slate-700/50 rounded p-2 text-xs">
                        <span className="text-slate-300">Copy live objects to new </span>
                        <span className="text-cyan-400">Survivor</span>
                        <span className="text-slate-300"> regions</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-8">3.</span>
                    <div className="flex-1 bg-slate-700/50 rounded p-2 text-xs">
                        <span className="text-slate-300">Promote aged objects to </span>
                        <span className="text-amber-400">Old</span>
                        <span className="text-slate-300"> generation</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-8">4.</span>
                    <div className="flex-1 bg-slate-700/50 rounded p-2 text-xs text-slate-300">
                        Free old Eden/Survivor regions
                    </div>
                </div>
            </div>
        </div>

        <p className="text-slate-400 text-xs italic">
            In the simulation, watch for regions turning <span className="text-red-400">red</span> – they're being collected!
        </p>
    </div>,

    // Step 5: Mixed GC
    <div key="g1-step-4" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Mixed GC (Major Collection)
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            When the heap gets too full, G1 runs <span className="text-purple-400 font-medium">Concurrent Marking</span>
            (works while app runs!), then performs a <span className="text-amber-400 font-medium">Mixed GC</span>.
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <p className="text-purple-400 font-medium text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Concurrent Mark
                    </p>
                    <ul className="text-slate-400 text-[11px] space-y-1 ml-4">
                        <li>• Runs alongside your app</li>
                        <li>• Finds garbage in Old regions</li>
                        <li>• Calculates "liveness"</li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <p className="text-amber-400 font-medium text-xs flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Mixed GC
                    </p>
                    <ul className="text-slate-400 text-[11px] space-y-1 ml-4">
                        <li>• Brief STW pause</li>
                        <li>• Collects Young regions</li>
                        <li>• + "garbage-rich" Old regions</li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <p className="text-purple-200/80 text-xs">
                <strong>Humongous Objects:</strong> Very large objects ({">"} 50% of region) get their own special
                <span className="text-purple-400"> purple H regions</span>.
            </p>
        </div>
    </div>,

    // Step 6: Summary & Start
    <div key="g1-step-5" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            Ready to Explore!
        </h4>

        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <p className="text-slate-200 text-sm font-medium">Quick Reference:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-[10px] font-bold">E</div>
                    <span className="text-slate-300">Eden – New objects</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center text-[10px] font-bold">S</div>
                    <span className="text-slate-300">Survivor – Observed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-600 flex items-center justify-center text-[10px] font-bold">O</div>
                    <span className="text-slate-300">Old – Long-lived</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold">H</div>
                    <span className="text-slate-300">Humongous – Large</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] flex items-center justify-center"></div>
                    <span className="text-slate-300">Red Glow – Being collected</span>
                </div>
            </div>
        </div>

        <div className="space-y-2 text-sm">
            <p className="text-slate-300">
                <span className="text-emerald-400 font-medium">▸ Play</span> – Start allocating objects
            </p>
            <p className="text-slate-300">
                <span className="text-cyan-400 font-medium">▸ Watch</span> – See Young/Mixed GC in action
            </p>
            <p className="text-slate-300">
                <span className="text-amber-400 font-medium">▸ Observe</span> – Objects age and get promoted
            </p>
        </div>
    </div>,
];

// ================================
// ZGC Tutorial Steps
// ================================
const zgcSteps: React.ReactNode[] = [
    // Step 1: The Latency Problem
    <div key="zgc-step-0" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            The Latency Problem
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            Traditional garbage collectors <span className="text-red-400 font-medium">pause your entire application</span>
            while cleaning up memory. These "Stop-The-World" (STW) pauses can be problematic for:
        </p>

        <div className="grid grid-cols-3 gap-2">
            {[
                { icon: '🎮', label: 'Games', desc: 'Lag spikes' },
                { icon: '💹', label: 'Trading', desc: 'Missed trades' },
                { icon: '🌐', label: 'APIs', desc: 'Slow responses' },
            ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-indigo-400 font-medium text-xs mt-1">{item.label}</p>
                    <p className="text-slate-500 text-[10px]">{item.desc}</p>
                </div>
            ))}
        </div>

        {/* Pause Comparison */}
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
            <p className="text-slate-400 text-xs font-medium mb-2">Typical Pause Times:</p>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs w-24">G1 GC</span>
                    <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-amber-500 to-red-500 rounded-full"></div>
                    </div>
                    <span className="text-amber-400 text-xs w-16">10-200ms</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-xs w-24 font-medium">ZGC</span>
                    <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[3%] bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"></div>
                    </div>
                    <span className="text-indigo-400 text-xs w-16 font-medium">{"<"} 1ms! 🚀</span>
                </div>
            </div>
        </div>
    </div>,

    // Step 2: ZGC's Magic - Concurrent Everything
    <div key="zgc-step-1" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            ZGC's Secret: Concurrent Everything
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            ZGC performs <span className="text-indigo-400 font-medium">almost all work concurrently</span> –
            while your application continues to run!
        </p>

        {/* Visual Comparison */}
        <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-2">Traditional (G1)</p>
                <div className="flex items-center gap-1">
                    <div className="flex-1 h-6 bg-emerald-500/50 rounded flex items-center justify-center text-[10px] text-white">App Running</div>
                    <div className="w-16 h-6 bg-red-500 rounded flex items-center justify-center text-[10px] text-white animate-pulse">PAUSE</div>
                    <div className="flex-1 h-6 bg-emerald-500/50 rounded flex items-center justify-center text-[10px] text-white">App Running</div>
                </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                <p className="text-indigo-400 text-xs mb-2 font-medium">ZGC (Concurrent)</p>
                <div className="relative h-10">
                    <div className="absolute inset-x-0 top-0 h-6 bg-emerald-500/50 rounded flex items-center justify-center text-[10px] text-white">
                        App Running Continuously ✓
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-indigo-500/30 rounded flex items-center justify-center text-[10px] text-indigo-300">
                        GC works in background
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-indigo-200/80 text-xs">
                <strong>Result:</strong> Your app stays responsive. Users never notice GC happening!
            </p>
        </div>
    </div>,

    // Step 3: ZGC Phases
    <div key="zgc-step-2" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            ZGC Collection Cycle
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            A ZGC cycle has 4 phases. Only 2 cause <span className="text-rose-400 font-medium">tiny</span> pauses ({"<"} 1ms each):
        </p>

        <div className="space-y-2">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-rose-500/20 rounded-lg px-2 py-1">
                    <span className="text-rose-400 text-xs font-mono">STW</span>
                </div>
                <div className="flex-1">
                    <p className="text-rose-400 font-medium text-sm">1. Mark Start</p>
                    <p className="text-slate-400 text-xs">Tiny pause to start marking. {"<"} 1ms!</p>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-blue-500/20 rounded-lg px-2 py-1">
                    <span className="text-blue-400 text-xs font-mono">CON</span>
                </div>
                <div className="flex-1">
                    <p className="text-blue-400 font-medium text-sm">2. Concurrent Mark</p>
                    <p className="text-slate-400 text-xs">Find all live objects while app runs.</p>
                </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-rose-500/20 rounded-lg px-2 py-1">
                    <span className="text-rose-400 text-xs font-mono">STW</span>
                </div>
                <div className="flex-1">
                    <p className="text-rose-400 font-medium text-sm">3. Mark End</p>
                    <p className="text-slate-400 text-xs">Tiny pause to finish marking. {"<"} 1ms!</p>
                </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-indigo-500/20 rounded-lg px-2 py-1">
                    <span className="text-indigo-400 text-xs font-mono">CON</span>
                </div>
                <div className="flex-1">
                    <p className="text-indigo-400 font-medium text-sm">4. Concurrent Relocate</p>
                    <p className="text-slate-400 text-xs">Move objects to compact memory. App keeps running!</p>
                </div>
            </div>
        </div>
    </div>,

    // Step 4: Colored Pointers (Simplified)
    <div key="zgc-step-3" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Box className="w-4 h-4 text-indigo-400" />
            How ZGC Works: Colored Pointers
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            ZGC uses a clever trick called <span className="text-indigo-400 font-medium">colored pointers</span>.
            It stores extra info in memory addresses!
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <p className="text-slate-400 text-xs font-medium">64-bit Pointer (Simplified):</p>
            <div className="flex gap-0.5 text-[9px] font-mono">
                <div className="flex-[4] bg-indigo-500 text-white p-2 rounded-l text-center">
                    Color Bits
                </div>
                <div className="flex-[12] bg-slate-600 text-white p-2 rounded-r text-center">
                    Object Address
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-700/50 rounded p-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mb-1"></div>
                    <p className="text-emerald-400 text-xs font-medium">Marked</p>
                    <p className="text-slate-500 text-[10px]">Object is alive</p>
                </div>
                <div className="bg-slate-700/50 rounded p-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mb-1"></div>
                    <p className="text-amber-400 text-xs font-medium">Remapped</p>
                    <p className="text-slate-500 text-[10px]">Pointer updated</p>
                </div>
            </div>
        </div>

        <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-indigo-200/80 text-xs">
                This lets ZGC know instantly if a pointer needs updating, without stopping the app!
            </p>
        </div>
    </div>,

    // Step 5: Pages (ZGC regions)
    <div key="zgc-step-4" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            ZGC Memory: Pages
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
            ZGC organizes memory into <span className="text-indigo-400 font-medium">Pages</span> of varying sizes.
            In our visualization, each cell represents a page:
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="grid grid-cols-6 gap-1 mb-3">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded text-[8px] font-bold flex items-center justify-center ${i < 6 ? 'bg-indigo-600 text-white' :
                            i >= 6 && i <= 8 ? 'bg-indigo-400 text-indigo-900' :
                                'bg-slate-700 border border-slate-600'
                            }`}
                    >
                        {i < 6 ? 'Z' : i >= 6 && i <= 8 ? 'R' : ''}
                    </div>
                ))}
            </div>
            <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-indigo-600"></div>
                    Z Page (Used)
                </span>
                <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-indigo-400"></div>
                    Relocating
                </span>
                <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-slate-700 border border-slate-600"></div>
                    Free
                </span>
            </div>
        </div>

        <p className="text-slate-400 text-xs">
            During relocation, pages turn <span className="text-indigo-400">lighter</span> as objects move out,
            then become <span className="text-slate-400">free</span>.
        </p>
    </div>,

    // Step 6: Summary
    <div key="zgc-step-5" className="space-y-4">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-400" />
            Ready to Explore!
        </h4>

        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <p className="text-slate-200 text-sm font-medium">Key Takeaways:</p>
            <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                    <span className="text-indigo-400">✓</span>
                    ZGC keeps pauses under 1ms, regardless of heap size
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-indigo-400">✓</span>
                    Most work happens concurrently (while app runs)
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-indigo-400">✓</span>
                    Uses colored pointers for instant state checks
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-indigo-400">✓</span>
                    Perfect for latency-sensitive applications
                </li>
            </ul>
        </div>

        <div className="space-y-2 text-sm">
            <p className="text-slate-300">
                <span className="text-indigo-400 font-medium">▸ Play</span> – Watch allocation continue during GC
            </p>
            <p className="text-slate-300">
                <span className="text-rose-400 font-medium">▸ STW</span> – Notice the brief red flash (pause)
            </p>
            <p className="text-slate-300">
                <span className="text-blue-400 font-medium">▸ Concurrent</span> – See pages relocate while running
            </p>
        </div>
    </div>,
];
