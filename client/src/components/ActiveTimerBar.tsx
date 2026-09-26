import { Square } from 'lucide-react';
import { useTimer } from '../context/TimerContext.js';

export function ActiveTimerBar() {
  const { activeTimer, formattedElapsed, stop, isStopping } = useTimer();

  if (!activeTimer) {
    return null;
  }

  return (
    <div className="bg-zinc-900 text-white border-b border-zinc-800 shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
        {/* Left: Active Task Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            Tracking:
          </span>

          <span className="text-xs font-medium text-white truncate max-w-[200px] sm:max-w-sm">
            {activeTimer.taskTitle}
          </span>
        </div>

        {/* Right: Elapsed Time & Stop Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="font-mono text-sm font-semibold tracking-wider text-emerald-400 tabular-nums">
            {formattedElapsed}
          </div>

          <button
            type="button"
            onClick={() => stop()}
            disabled={isStopping}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>{isStopping ? 'Stopping...' : 'Stop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
