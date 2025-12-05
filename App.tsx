import React, { useState } from 'react';
import { HeapGrid } from './components/HeapGrid';
import { StatsPanel } from './components/StatsPanel';
import { Legend } from './components/Legend';
import { useG1Simulation } from './hooks/useG1Simulation';
import { Play, Pause, RotateCcw, Info, X } from 'lucide-react';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showIntro, setShowIntro] = useState(true);
  
  const { regions, phase, stats, logs, reset } = useG1Simulation(isRunning, speed);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      
      {/* Header - Fixed Height */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-slate-900">G1</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent leading-none">
              G1 GC Visualizer
            </h1>
            <p className="text-slate-500 text-xs hidden sm:block">JVM Memory Simulation</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <button 
              onClick={() => setShowIntro(!showIntro)}
              className={`text-sm flex items-center gap-1 transition-colors ${showIntro ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Info size={16} /> Guide
           </button>
        </div>
      </header>

      {/* Intro Modal / Overlay */}
      {showIntro && (
        <div className="absolute top-20 right-6 z-50 w-80 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-4 shadow-2xl text-sm text-slate-300">
          <div className="flex justify-between items-start mb-3">
             <h3 className="font-bold text-white">How it works</h3>
             <button onClick={() => setShowIntro(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <strong className="text-emerald-400 block text-xs uppercase tracking-wider">1. Eden Allocation</strong>
              <p className="text-xs">Objects spawn in <span className="text-emerald-400">Green</span> regions. When full, Young GC begins.</p>
            </div>
            <div>
               <strong className="text-cyan-400 block text-xs uppercase tracking-wider">2. Young GC</strong>
               <p className="text-xs">Live objects move to <span className="text-cyan-400">Survivor</span>. Aged objects promote to <span className="text-amber-500">Old</span>.</p>
            </div>
            <div>
               <strong className="text-amber-500 block text-xs uppercase tracking-wider">3. Mixed GC</strong>
               <p className="text-xs">Marks live objects, then collects Young + candidate <span className="text-amber-500">Old</span> regions with most garbage.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Flex Grow to fill screen */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Left Column: Visualizer (Flexible) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-950/30 relative">
          
          {/* Controls Bar */}
          <div className="shrink-0 p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/50">
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsRunning(!isRunning)}
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
                  onClick={() => { setIsRunning(false); reset(); }}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
                  title="Reset Simulation"
                >
                  <RotateCcw size={18} />
                </button>
             </div>

             <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 font-mono uppercase px-2">Speed</span>
                <div className="flex gap-1">
                   {[0.5, 1, 2, 4].map(s => (
                     <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`w-8 h-6 text-xs rounded font-medium transition-colors ${speed === s ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                     >
                       {s}x
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Grid Container - Centers grid and prevents overflow */}
          <div className="flex-1 min-h-0 p-4 flex items-center justify-center overflow-hidden">
             {/* Aspect Ratio Box: Constrained by both width and height to fit in viewport */}
             <div className="relative aspect-square h-full max-h-full w-auto max-w-full">
                <HeapGrid regions={regions} />
             </div>
          </div>

          {/* Footer Legend */}
          <div className="shrink-0 border-t border-slate-800 bg-slate-900/30">
             <Legend />
          </div>
        </div>

        {/* Right Column: Stats & Logs (Fixed Width on Desktop) */}
        <div className="lg:w-96 shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/20 z-10 backdrop-blur-sm">
          
          <div className="p-4 shrink-0">
            <StatsPanel stats={stats} currentPhase={phase} />
          </div>

          {/* Logs - Fills remaining vertical space */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-slate-800">
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Event Log
                 <span className="bg-slate-800 text-slate-500 px-1.5 rounded-full text-[10px]">{logs.length}</span>
               </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs custom-scrollbar">
               {logs.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                    <p>Ready to start...</p>
                 </div>
               )}
               {logs.map((log) => (
                 <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`break-words
                      ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                      ${log.type === 'warn' ? 'text-amber-400' : ''}
                      ${log.type === 'success' ? 'text-emerald-400' : ''}
                      ${log.type === 'info' ? 'text-slate-300' : ''}
                    `}>
                      {log.message}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;