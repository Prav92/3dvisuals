import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assemblyTelemetry, efficiencyBand, efficiencyScore, staffingLevel, stageStatuses } from '../src/lib/assembly';
import { useAssemblyStore } from '../src/store/useAssemblyStore';

test('baseline telemetry matches the dashboard defaults', () => {
  const m = assemblyTelemetry(92, 0);
  assert.equal(m.activeRobots, 16);
  assert.equal(m.activeWorkers, 28);
  assert.equal(m.defectRate, 0.14);
});

test('zero efficiency halts production', () => {
  const m = assemblyTelemetry(0, 5);
  assert.equal(m.unitsPerHour, 0);
  assert.equal(m.activeRobots, 0);
  assert.equal(efficiencyBand(0), 'HALTED');
  assert.ok(stageStatuses(0).every((s) => s.tone === 'red'));
});

test('efficiency bands and stage tones follow efficiency', () => {
  assert.equal(efficiencyBand(92), 'HIGH');
  assert.equal(efficiencyBand(60), 'MEDIUM');
  assert.equal(efficiencyBand(20), 'LOW');
  assert.equal(stageStatuses(92)[1].status, 'Optimal');
  assert.equal(stageStatuses(60)[1].tone, 'amber');
});

test('store clamps efficiency, pauses, honours speed and bounds history', () => {
  const store = useAssemblyStore;
  store.setState(store.getInitialState(), true);
  store.getState().setEfficiency(250);
  assert.equal(store.getState().efficiencyRate, 100);
  store.getState().setEfficiency(-5);
  assert.equal(store.getState().efficiencyRate, 0);
  store.getState().setEfficiency(92);
  store.getState().togglePause();
  store.getState().tick(1);
  assert.equal(store.getState().simulationSeconds, 0);
  store.getState().togglePause();
  store.getState().setSpeed(10);
  store.getState().tick(1);
  assert.equal(store.getState().simulationSeconds, 10);
  for (let i = 0; i < 100; i++) store.getState().tick(0.25);
  assert.equal(store.getState().history.length, 60);
});

test('efficiency score scales with staffing', () => {
  assert.equal(efficiencyScore(92, 28), 92);
  assert.ok(efficiencyScore(92, 14) < efficiencyScore(92, 22));
  assert.ok(efficiencyScore(92, 22) < 92);
  assert.ok(efficiencyScore(92, 40) < 92);
  assert.equal(efficiencyScore(92, 0), 0);
  assert.equal(staffingLevel(10), 'UNDERSTAFFED');
  assert.equal(staffingLevel(28), 'OPTIMAL');
  assert.equal(staffingLevel(38), 'OVERSTAFFED');
});

test('adding and removing workers updates score and metrics within bounds', () => {
  const store = useAssemblyStore;
  store.setState(store.getInitialState(), true);
  assert.equal(store.getState().effectiveEfficiency, 92);
  store.getState().removeWorker();
  assert.equal(store.getState().workerCount, 27);
  assert.equal(store.getState().metrics.activeWorkers, 27);
  assert.ok(store.getState().effectiveEfficiency < 92);
  store.getState().setWorkers(-5);
  assert.equal(store.getState().workerCount, 0);
  assert.equal(store.getState().effectiveEfficiency, 0);
  store.getState().setWorkers(999);
  assert.equal(store.getState().workerCount, 40);
  store.getState().setWorkers(28);
  assert.equal(store.getState().effectiveEfficiency, 92);
});
