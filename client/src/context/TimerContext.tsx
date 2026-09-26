import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ActiveTimer } from '../types/timeLog.types.js';
import {
  fetchActiveTimer,
  startTimer,
  stopTimer,
} from '../services/timeLog.service.js';
import { useAuth } from './AuthContext.js';

interface TimerContextType {
  activeTimer: ActiveTimer | null;
  elapsedSeconds: number;
  formattedElapsed: string;
  isStarting: boolean;
  isStopping: boolean;
  pendingTaskId: string | null;
  start: (taskId: string) => Promise<void>;
  stop: () => Promise<void>;
  refreshTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function formatHms(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  // Sync with server
  const refreshTimer = useCallback(async () => {
    if (!user) {
      setActiveTimer(null);
      setElapsedSeconds(0);
      return;
    }

    try {
      const active = await fetchActiveTimer();
      setActiveTimer(active);
      if (active) {
        const startMs = new Date(active.startTime).getTime();
        setElapsedSeconds(
          Math.max(0, Math.floor((Date.now() - startMs) / 1000))
        );
      } else {
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error('[TimerContext] Failed to fetch active timer:', err);
    }
  }, [user]);

  // Initial fetch and focus refetch
  useEffect(() => {
    refreshTimer();

    const handleFocus = () => {
      refreshTimer();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshTimer]);

  // Multi-tab broadcast channel sync
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('suntek_timer_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'TIMER_SYNC') {
            refreshTimer();
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
            queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
          }
        };
      }
    } catch (err) {
      console.warn('[TimerContext] BroadcastChannel not supported:', err);
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [refreshTimer, queryClient]);

  const notifyOtherTabs = () => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('suntek_timer_channel');
        channel.postMessage({ type: 'TIMER_SYNC' });
        channel.close();
      }
    } catch {
      // Non-critical
    }
  };

  // Real-time ticker based on server startTime
  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(activeTimer.startTime).getTime();
    const tick = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startMs) / 1000)));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const start = async (taskId: string): Promise<void> => {
    setIsStarting(true);
    setPendingTaskId(taskId);
    try {
      const newActive = await startTimer(taskId);
      setActiveTimer(newActive);
      setElapsedSeconds(0);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      notifyOtherTabs();
    } finally {
      setIsStarting(false);
      setPendingTaskId(null);
    }
  };

  const stop = async (): Promise<void> => {
    setIsStopping(true);
    try {
      await stopTimer();
      setActiveTimer(null);
      setElapsedSeconds(0);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      notifyOtherTabs();
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        elapsedSeconds,
        formattedElapsed: formatHms(elapsedSeconds),
        isStarting,
        isStopping,
        pendingTaskId,
        start,
        stop,
        refreshTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerContextType {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
