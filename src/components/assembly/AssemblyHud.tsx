'use client';
import Link from 'next/link';
import { Minus, Pause, Play, Plus } from 'lucide-react';
import { efficiencyBand, MAX_ROBOTS, MAX_WORKERS, OPTIMAL_WORKERS, staffingFactor, staffingLevel, stageStatuses, type SimSpeed } from '@/lib/assembly';
import { useAssemblyStore } from '@/store/useAssemblyStore';

function Sparkline({ values, color, min, max }: { values: number[]; color: string; min: number; max: number }) {
  const span = Math.max(max - min, 1e-6);
  const points = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 120},${26 - ((Math.min(Math.max(v, min), max) - min) / span) * 24}`).join(' ');
  return (
    <svg className="asm-spark" viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MetricsPanel() {
  const metrics = useAssemblyStore((s) => s.metrics);
  const history = useAssemblyStore((s) => s.history);
  const paused = useAssemblyStore((s) => s.paused);
  return (
    <section className="asm-panel asm-metrics" aria-label="Assembly metrics">
      <div className="asm-panel-head">
        <h2>ASSEMBLY METRICS</h2>
        <span className={`asm-live ${paused ? 'paused' : ''}`}>{paused ? 'PAUSED' : 'LIVE'}</span>
      </div>
      <div className="asm-stat">
        <div>
          <span className="asm-label">THROUGHPUT</span>
          <strong className="green">{metrics.throughput.toFixed(0)}%</strong>
        </div>
        <Sparkline values={history.map((h) => h.throughput)} color="#34d399" min={0} max={100} />
      </div>
      <div className="asm-stat">
        <div>
          <span className="asm-label">DEFECT RATE</span>
          <strong className="orange">{metrics.defectRate.toFixed(2)}%</strong>
        </div>
        <Sparkline values={history.map((h) => h.defectRate)} color="#fb923c" min={0} max={Math.max(0.6, ...history.map((h) => h.defectRate))} />
      </div>
      <div className="asm-duo">
        <div>
          <span className="asm-label">ACTIVE ROBOTS</span>
          <strong>{metrics.activeRobots}<small> / {MAX_ROBOTS}</small></strong>
        </div>
        <div>
          <span className="asm-label">ACTIVE WORKERS</span>
          <strong>{metrics.activeWorkers}<small> / {OPTIMAL_WORKERS}</small></strong>
        </div>
      </div>
      <div className="asm-foot">
        <span className="asm-label">UNITS / HOUR</span>
        <strong>{metrics.unitsPerHour}</strong>
      </div>
    </section>
  );
}

export function SectorPanel() {
  const efficiency = useAssemblyStore((s) => s.effectiveEfficiency);
  const stages = stageStatuses(efficiency);
  return (
    <section className="asm-panel asm-sectors" aria-label="Active sector status">
      <div className="asm-panel-head">
        <h2>ACTIVE SECTOR STATUS</h2>
      </div>
      <ul>
        {stages.map((stage) => (
          <li key={stage.id} className={`asm-stage ${stage.tone}`}>
            <span className="asm-stage-name">Stage {stage.id}: {stage.name}</span>
            <span className="asm-badge">{stage.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkforcePanel() {
  const workers = useAssemblyStore((s) => s.workerCount);
  const target = useAssemblyStore((s) => s.efficiencyRate);
  const score = useAssemblyStore((s) => s.effectiveEfficiency);
  const level = staffingLevel(workers);
  const band = efficiencyBand(score);
  const scoreTone = band === 'HIGH' ? 'green' : band === 'MEDIUM' ? 'amber' : 'red';
  const levelTone = level === 'OPTIMAL' ? 'green' : 'amber';
  const circumference = 2 * Math.PI * 30;
  const delta = workers - OPTIMAL_WORKERS;
  return (
    <section className="asm-panel asm-workforce" aria-label="Workforce and efficiency score">
      <div className="asm-panel-head">
        <h2>WORKFORCE &amp; EFFICIENCY SCORE</h2>
      </div>
      <div className="asm-score">
        <div className={`asm-ring ${scoreTone}`} role="img" aria-label={`Efficiency score ${score} percent`}>
          <svg viewBox="0 0 72 72" aria-hidden="true">
            <circle cx="36" cy="36" r="30" className="track" />
            <circle cx="36" cy="36" r="30" className="value" strokeDasharray={`${(score / 100) * circumference} ${circumference}`} transform="rotate(-90 36 36)" />
          </svg>
          <strong>{score}</strong>
        </div>
        <div className="asm-score-info">
          <span className="asm-label">EFFICIENCY SCORE</span>
          <span className={`asm-badge ${levelTone}`}>{level}</span>
          <small>Target {target}% × staffing {Math.round(staffingFactor(workers) * 100)}%</small>
        </div>
      </div>
      <div className="asm-workers-ctl">
        <button type="button" aria-label="Remove worker" disabled={workers <= 0} onClick={() => useAssemblyStore.getState().removeWorker()}><Minus size={16} /></button>
        <div className="asm-worker-count" aria-live="polite">
          <strong>{workers}</strong>
          <span>WORKERS</span>
        </div>
        <button type="button" aria-label="Add worker" disabled={workers >= MAX_WORKERS} onClick={() => useAssemblyStore.getState().addWorker()}><Plus size={16} /></button>
      </div>
      <div className="asm-worker-hint">
        <span>Optimal: {OPTIMAL_WORKERS} · {delta === 0 ? 'at optimum' : delta < 0 ? `${-delta} short` : `${delta} over`}</span>
        <button type="button" disabled={delta === 0} onClick={() => useAssemblyStore.getState().setWorkers(OPTIMAL_WORKERS)}>Reset</button>
      </div>
    </section>
  );
}

export function ControlBar() {
  const efficiency = useAssemblyStore((s) => s.efficiencyRate);
  const score = useAssemblyStore((s) => s.effectiveEfficiency);
  const speed = useAssemblyStore((s) => s.timeSpeed);
  const paused = useAssemblyStore((s) => s.paused);
  const setEfficiency = useAssemblyStore((s) => s.setEfficiency);
  const band = efficiencyBand(score);
  const tone = band === 'HIGH' ? 'green' : band === 'MEDIUM' ? 'amber' : 'red';
  return (
    <div className="asm-controls-wrap">
      <div className="asm-simnote"><span className="asm-dot" /> SIMULATED DATA · DRAG TO ORBIT · RIGHT-DRAG TO PAN · SCROLL TO ZOOM</div>
      <section className="asm-panel asm-controls" aria-label="Simulation controls">
        <div className="asm-eff">
          <label htmlFor="asm-efficiency" className="asm-label">EFFICIENCY TARGET · {efficiency}%</label>
          <div className="asm-sliderrow">
            <button type="button" aria-label="Decrease efficiency" onClick={() => setEfficiency(efficiency - 5)}><Minus size={14} /></button>
            <input id="asm-efficiency" type="range" min={0} max={100} step={1} value={efficiency} aria-label="Efficiency target" style={{ ['--fill' as string]: `${efficiency}%` }} onChange={(e) => setEfficiency(Number(e.target.value))} />
            <button type="button" aria-label="Increase efficiency" onClick={() => setEfficiency(efficiency + 5)}><Plus size={14} /></button>
          </div>
        </div>
        <span className={`asm-pill ${tone}`}>{score}% EFFICIENCY ({band})</span>
        <div className="asm-speed" role="group" aria-label="Simulation speed">
          <button type="button" aria-label={paused ? 'Resume simulation' : 'Pause simulation'} onClick={() => useAssemblyStore.getState().togglePause()}>
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          {([1, 10, 60] as SimSpeed[]).map((n) => (
            <button type="button" key={n} aria-pressed={speed === n} className={speed === n ? 'on' : ''} onClick={() => useAssemblyStore.getState().setSpeed(n)}>{n}x</button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function TopBar() {
  return (
    <div className="asm-topbar">
      <Link href="/" className="asm-back">← ALL SIMULATIONS</Link>
      <div className="asm-title">
        <span className="asm-dot" /> NEXUS <i /> <span>AUTOMOTIVE ASSEMBLY · PLANT 02</span>
      </div>
    </div>
  );
}
