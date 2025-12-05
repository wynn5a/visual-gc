import React, { useState } from 'react';
import { HeapGrid } from './components/HeapGrid';
import { StatsPanel } from './components/StatsPanel';
import { Legend } from './components/Legend';
import { Header } from './components/Header';
import { ControlBar } from './components/ControlBar';
import { IntroModal } from './components/IntroModal';
import { EventLog } from './components/EventLog';
import { useGCSimulation } from './hooks/useGCSimulation';
import { GCMode } from './types';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<GCMode>(GCMode.G1);
  const [showIntro, setShowIntro] = useState(true);

  const { regions, phase, stats, logs, reset } = useGCSimulation(isRunning, speed, mode);

  const handleModeChange = (newMode: GCMode) => {
    setIsRunning(false);
    setMode(newMode);
    reset();
  };

  const handleToggleRunning = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    reset();
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      <Header
        mode={mode}
        showIntro={showIntro}
        onModeChange={handleModeChange}
        onToggleIntro={() => setShowIntro(!showIntro)}
      />

      {showIntro && (
        <IntroModal mode={mode} onClose={() => setShowIntro(false)} />
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Column: Controls + Heap Grid + Legend */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-950/30 relative">
          <ControlBar
            isRunning={isRunning}
            speed={speed}
            onToggleRunning={handleToggleRunning}
            onReset={handleReset}
            onSpeedChange={setSpeed}
          />

          {/* Grid Container */}
          <div className="flex-1 min-h-0 p-2 md:p-4 flex items-center justify-center overflow-hidden">
            <div className="relative aspect-square h-full max-h-full w-auto max-w-full">
              <HeapGrid regions={regions} />
            </div>
          </div>

          {/* Footer Legend */}
          <div className="shrink-0 border-t border-slate-800 bg-slate-900/30">
            <Legend mode={mode} />
          </div>
        </div>

        {/* Right Column: Stats & Logs - Hidden on mobile when intro is shown */}
        {/* Right Column: Stats & Logs */}
        <div className="lg:w-96 shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/20 z-10 backdrop-blur-sm flex">
          <div className="p-3 md:p-4 shrink-0">
            <StatsPanel stats={stats} currentPhase={phase} />
          </div>
          <EventLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default App;
