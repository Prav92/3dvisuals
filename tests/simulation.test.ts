import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  telemetry,
  getMotionState,
  efficiencyScore,
  staffingLevel,
  OPTIMAL_WORKERS,
} from '../src/lib/simulation';
import { useWarehouseStore } from '../src/store/useWarehouseStore';

test('zero efficiency stops throughput and queues vehicles', () => {
  assert.equal(telemetry(0, 10).ordersPerHour, 0);
  assert.equal(getMotionState(0.5, 0, 1), 'queuing');
});

test('pause freezes time, resume respects speed, history is bounded', () => {
  const store = useWarehouseStore;
  store.setState(store.getInitialState(), true);
  store.getState().togglePause();
  store.getState().tick(1);
  assert.equal(store.getState().simulationSeconds, 0);
  store.getState().togglePause();
  store.getState().setSpeed(60);
  store.getState().tick(1);
  assert.equal(store.getState().simulationSeconds, 60);
  for (let i = 0; i < 100; i++) store.getState().tick(0.25);
  assert.equal(store.getState().history.length, 60);
});

test('efficiency clamps and alerts recover', () => {
  const s = useWarehouseStore.getState();
  s.setEfficiency(-10);
  assert.equal(useWarehouseStore.getState().efficiencyRate, 0);
  assert.ok(useWarehouseStore.getState().systemAlerts.length);
  s.setEfficiency(200);
  assert.equal(useWarehouseStore.getState().efficiencyRate, 100);
  assert.equal(useWarehouseStore.getState().systemAlerts.length, 0);
});

test('waypoints include handling and transit states', () => {
  assert.equal(getMotionState(0.01, 94, 1), 'picking');
  assert.equal(getMotionState(0.5, 94, 1), 'transit');
  assert.equal(getMotionState(0.95, 94, 1), 'offloading');
});

test('workforce headcount alters effective score and triggers alerts when low', () => {
  const store = useWarehouseStore;
  store.setState(store.getInitialState(), true);

  assert.equal(store.getState().effectiveEfficiency, 94);
  assert.equal(store.getState().workerCount, OPTIMAL_WORKERS);
  assert.equal(staffingLevel(OPTIMAL_WORKERS), 'OPTIMAL');

  // Reducing workers reduces effective score
  store.getState().removeWorker();
  assert.equal(store.getState().workerCount, OPTIMAL_WORKERS - 1);
  assert.ok(store.getState().effectiveEfficiency < 94);

  // Severe understaffing lowers score & triggers understaffing alert
  store.getState().setWorkers(4);
  assert.equal(store.getState().workerCount, 4);
  assert.equal(staffingLevel(4), 'UNDERSTAFFED');
  assert.ok(store.getState().effectiveEfficiency < 60);
  assert.ok(store.getState().systemAlerts.includes('Floor 01 understaffed'));

  // Reset to optimal clears understaffing
  store.getState().setWorkers(OPTIMAL_WORKERS);
  assert.equal(store.getState().effectiveEfficiency, 94);
  assert.equal(store.getState().systemAlerts.length, 0);

  // Overstaffing test
  assert.equal(staffingLevel(18), 'OVERSTAFFED');
  assert.ok(efficiencyScore(94, 18) < 94); // Crowding penalty
});
