import { useState, useEffect, useRef, useCallback } from 'react';
import { SimRate } from '../types';

const STORAGE_KEY_TIME = 'dmp_simulated_time';
const STORAGE_KEY_RATE = 'dmp_simulated_rate';
const STORAGE_KEY_PAUSED = 'dmp_simulated_paused';

export function useSimulatedClock() {
  const [simulatedTime, setSimulatedTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIME);
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return Date.now();
  });

  const [rate, setRateState] = useState<SimRate>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RATE);
      if (saved) {
        const parsed = Number(saved) as SimRate;
        const validRates = [-2, -1, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
        if (validRates.includes(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return 1;
  });

  const [isPaused, setIsPausedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAUSED);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // Fallback
    }
    return false;
  });

  const timeRef = useRef(simulatedTime);
  const rateRef = useRef(rate);
  const isPausedRef = useRef(isPaused);
  const lastRealTimeRef = useRef<number>(performance.now());
  const lastSavedTimeRef = useRef<number>(Date.now());

  // Keep refs in sync
  useEffect(() => {
    rateRef.current = rate;
    try {
      localStorage.setItem(STORAGE_KEY_RATE, String(rate));
    } catch {
      // Ignore
    }
  }, [rate]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    try {
      localStorage.setItem(STORAGE_KEY_PAUSED, String(isPaused));
    } catch {
      // Ignore
    }
  }, [isPaused]);

  // Save current simulated time to localStorage helper
  const persistSimulatedTime = useCallback((t: number) => {
    try {
      localStorage.setItem(STORAGE_KEY_TIME, String(Math.round(t)));
    } catch {
      // Ignore
    }
  }, []);

  // Set speed and direction: starts simulation at that rate
  const setSpeedAndDirection = useCallback((newRate: SimRate) => {
    setRateState(newRate);
    rateRef.current = newRate;
    setIsPausedState(false);
    isPausedRef.current = false;
    lastRealTimeRef.current = performance.now();
    setSimulatedTime(timeRef.current);
    persistSimulatedTime(timeRef.current);
  }, [persistSimulatedTime]);

  // Pause / Resume: freezes or resumes at last selected rate
  const togglePause = useCallback(() => {
    setIsPausedState((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      if (!next) {
        lastRealTimeRef.current = performance.now();
      }
      setSimulatedTime(timeRef.current);
      persistSimulatedTime(timeRef.current);
      return next;
    });
  }, [persistSimulatedTime]);

  // Step fast forward: 2x, then *2 each time up to 1024x, then wrap to 2x
  const stepFastForward = useCallback(() => {
    let nextRate: number;
    if (isPausedRef.current || rateRef.current < 2) {
      nextRate = 2;
    } else {
      nextRate = rateRef.current * 2;
      if (nextRate > 1024) {
        nextRate = 2;
      }
    }
    setSpeedAndDirection(nextRate);
  }, [setSpeedAndDirection]);

  // Step reverse: -1x, then -2x, then wrap to -1x
  const stepReverse = useCallback(() => {
    let nextRate: number;
    if (isPausedRef.current || rateRef.current > -1) {
      nextRate = -1;
    } else if (rateRef.current === -1) {
      nextRate = -2;
    } else {
      nextRate = -1;
    }
    setSpeedAndDirection(nextRate);
  }, [setSpeedAndDirection]);

  const lastStateUpdateRef = useRef<number>(performance.now());

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    lastRealTimeRef.current = performance.now();
    lastStateUpdateRef.current = performance.now();

    const tick = () => {
      const nowReal = performance.now();
      const deltaReal = nowReal - lastRealTimeRef.current;
      lastRealTimeRef.current = nowReal;

      if (!isPausedRef.current) {
        // Calculate advance in simulated milliseconds
        const deltaSim = deltaReal * rateRef.current;
        timeRef.current += deltaSim;

        // Throttle React state update to every 50ms (~20 FPS) for smooth visual updates without excessive re-renders
        if (nowReal - lastStateUpdateRef.current >= 50) {
          setSimulatedTime(timeRef.current);
          lastStateUpdateRef.current = nowReal;
        }

        // Throttle persistence to localStorage every 1.5 seconds
        const realWallNow = Date.now();
        if (realWallNow - lastSavedTimeRef.current > 1500) {
          persistSimulatedTime(timeRef.current);
          lastSavedTimeRef.current = realWallNow;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const handleBeforeUnload = () => {
      persistSimulatedTime(timeRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      persistSimulatedTime(timeRef.current);
    };
  }, [persistSimulatedTime]);

  return {
    simulatedTime,
    rate,
    isPaused,
    setSpeedAndDirection,
    togglePause,
    stepFastForward,
    stepReverse,
  };
}
