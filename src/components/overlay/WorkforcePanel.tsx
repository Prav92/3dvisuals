'use client';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import {
  OPTIMAL_WORKERS,
  MAX_WORKERS,
  staffingLevel,
  staffingFactor,
} from '@/lib/simulation';

export default function WorkforcePanel() {
  const workers = useWarehouseStore((s) => s.workerCount);
  const target = useWarehouseStore((s) => s.efficiencyRate);
  const score = useWarehouseStore((s) => s.effectiveEfficiency);
  const level = staffingLevel(workers);

  const scoreTone = score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red';
  const levelTone = level === 'OPTIMAL' ? 'green' : 'amber';
  const circumference = 2 * Math.PI * 30;
  const delta = workers - OPTIMAL_WORKERS;

  return (
    <section className="panel workforce-card" aria-label="Warehouse workforce and efficiency score">
      <div className="eyebrow">
        <span>WORKFORCE &amp; EFFICIENCY SCORE</span>
        <span className={`live ${scoreTone === 'green' ? '' : scoreTone}`}>
          ● {level}
        </span>
      </div>

      <div className="wf-score-row">
        <div className={`wf-ring ${scoreTone}`} role="img" aria-label={`Efficiency score ${score} percent`}>
          <svg viewBox="0 0 72 72" aria-hidden="true">
            <circle cx="36" cy="36" r="30" className="wf-track" />
            <circle
              cx="36"
              cy="36"
              r="30"
              className="wf-value"
              strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
              transform="rotate(-90 36 36)"
            />
          </svg>
          <strong className="wf-ring-number">{score}<span>%</span></strong>
        </div>

        <div className="wf-score-meta">
          <label>EFFICIENCY SCORE</label>
          <div className="wf-staff-tag">
            <span className={`wf-badge ${levelTone}`}>{level} STAFFING</span>
          </div>
          <small className="muted">
            Target {target}% × staffing {Math.round(staffingFactor(workers) * 100)}%
          </small>
        </div>
      </div>

      <div className="wf-stepper">
        <button
          type="button"
          aria-label="Reduce floor crew"
          disabled={workers <= 0}
          onClick={() => useWarehouseStore.getState().removeWorker()}
        >
          <Minus size={15} />
        </button>

        <div className="wf-counter">
          <strong>{workers}</strong>
          <span>FLOOR CREW</span>
        </div>

        <button
          type="button"
          aria-label="Add floor crew"
          disabled={workers >= MAX_WORKERS}
          onClick={() => useWarehouseStore.getState().addWorker()}
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="wf-footer">
        <span>
          Optimal: {OPTIMAL_WORKERS} · {delta === 0 ? 'at optimum' : delta < 0 ? `${-delta} short` : `${delta} over`}
        </span>
        <button
          type="button"
          className="wf-reset-btn"
          disabled={delta === 0}
          onClick={() => useWarehouseStore.getState().setWorkers(OPTIMAL_WORKERS)}
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>
    </section>
  );
}
