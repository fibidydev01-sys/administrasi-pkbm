"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownReturn {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

/**
 * Hook untuk countdown timer
 * @param targetTime - Target time string (HH:MM or HH:MM:SS)
 * @param onExpire - Callback when countdown reaches 0
 */
export function useCountdown(
  targetTime: string | null,
  onExpire?: () => void
): CountdownReturn {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!targetTime) return 0;

    const now = new Date();
    const [hours, minutes, seconds = 0] = targetTime.split(":").map(Number);
    const target = new Date();
    target.setHours(hours, minutes, seconds, 0);

    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }, [targetTime]);

  useEffect(() => {
    if (!targetTime) {
      setTimeLeft(0);
      setIsExpired(true);
      return;
    }

    setTimeLeft(calculateTimeLeft());
    setIsExpired(false);

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        setIsExpired(true);
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, calculateTimeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    minutes,
    seconds,
    isExpired,
    formatted,
  };
}

/**
 * Hook untuk auto-refresh pada interval tertentu
 */
export function useAutoRefresh(callback: () => void, intervalMs: number = 60000) {
  useEffect(() => {
    const interval = setInterval(callback, intervalMs);
    return () => clearInterval(interval);
  }, [callback, intervalMs]);
}

/**
 * Hook untuk mendapatkan waktu sekarang yang update setiap detik
 */
export function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
}