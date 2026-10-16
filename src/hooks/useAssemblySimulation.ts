'use client';
import { useEffect } from 'react';
import { useAssemblyStore } from '@/store/useAssemblyStore';

/** Advances assembly telemetry every 250 ms; delta is capped so background tabs don't cause time jumps. */
export function useAssemblySimulation() {
  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      useAssemblyStore.getState().tick(Math.min((now - last) / 1000, 0.5));
      last = now;
    }, 250);
    return () => window.clearInterval(timer);
  }, []);
}
