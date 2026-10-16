'use client';
import { useEffect } from 'react';
import { useWarehouseStore } from '@/store/useWarehouseStore';
export function useWarehouseSimulation() {
 useEffect(() => { let last = performance.now(); const timer = window.setInterval(() => { const now = performance.now(); useWarehouseStore.getState().tick(Math.min((now - last) / 1000, 0.5)); last = now; }, 250); return () => window.clearInterval(timer); }, []);
}
