import React from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { SimRate } from '../types';
import { formatSimulatedDateTime } from '../utils/markdown';

interface TimeControlsBarProps {
  simulatedTime: number;
  rate: SimRate;
  isPaused: boolean;
  onStepFastForward: () => void;
  onStepReverse: () => void;
  onSetNormalSpeed: () => void;
  onTogglePause: () => void;
}

export const TimeControlsBar: React.FC<TimeControlsBarProps> = ({
  simulatedTime,
  rate,
  isPaused,
  onStepFastForward,
  onStepReverse,
  onSetNormalSpeed,
  onTogglePause,
}) => {
  const getRateLabel = (r: SimRate): string => {
    if (r < 0) return `Reverse ${Math.abs(r)}×`;
    return `Forward ${r}×`;
  };

  const statusText = isPaused ? `Paused (${getRateLabel(rate)})` : getRateLabel(rate);

  // Compute what the next reverse rate will be when clicked
  const nextReverseRate = !isPaused && rate === -1 ? 2 : 1;

  // Compute what the next fast-forward rate will be when clicked
  let nextForwardRate = 2;
  if (!isPaused && rate >= 2) {
    nextForwardRate = rate < 1024 ? rate * 2 : 2;
  }

  const isReversing = !isPaused && rate < 0;
  const isFastForwarding = !isPaused && rate >= 2;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white shadow-2xl px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Simulated Date/Time & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-center md:text-left justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-slate-100">
              {formatSimulatedDateTime(simulatedTime)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-1 sm:pl-3 sm:border-l border-slate-700">
            <span className="text-[11px] text-slate-400">Rate:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : rate < 0
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {statusText}
            </span>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Repeating Reverse Button (up to 2x) */}
          <button
            type="button"
            onClick={onStepReverse}
            title={`Click to reverse at ${nextReverseRate}× speed`}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isReversing
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              Reverse {isReversing ? `${Math.abs(rate)}× (next: ${nextReverseRate}×)` : '1×'}
            </span>
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-300'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Pause
              </>
            )}
          </button>

          {/* Normal 1× Speed reset */}
          <button
            type="button"
            onClick={onSetNormalSpeed}
            title="Reset to 1× standard speed"
            className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              !isPaused && rate === 1
                ? 'bg-slate-700 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            1× Normal
          </button>

          {/* Repeating Fast Forward Button (2x -> 4x -> ... -> 1024x) */}
          <button
            type="button"
            onClick={onStepFastForward}
            title={`Click to fast-forward at ${nextForwardRate}× speed (up to 1024×)`}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isFastForwarding
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>
              {isFastForwarding
                ? `Fast Forward ${rate}× (next: ${nextForwardRate}×)`
                : 'Fast Forward 2×'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
