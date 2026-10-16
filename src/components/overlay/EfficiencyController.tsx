import { Minus, Plus, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useWarehouseStore } from '@/store/useWarehouseStore';

export default function EfficiencyController() {
  const efficiency = useWarehouseStore((s) => s.efficiencyRate);
  const effectiveEfficiency = useWarehouseStore((s) => s.effectiveEfficiency);
  const speed = useWarehouseStore((s) => s.timeSpeed);
  const paused = useWarehouseStore((s) => s.paused);
  const setEfficiency = useWarehouseStore((s) => s.setEfficiency);

  return (
    <footer>
      <div className="event">
        <span className="dot" />
        <span>
          {paused
            ? 'Simulation paused'
            : effectiveEfficiency < 60
            ? 'AGV queue at junction B · Dispatch delayed'
            : 'AGV–028 → Dispatch lane · Route clear'}
        </span>
        <span className="simlabel">SIMULATED DATA</span>
      </div>
      <section className="panel controls">
        <div className="efficiency">
          <div>
            <label>FULFILLMENT EFFICIENCY TARGET</label>
            <strong>
              {efficiency}%{' '}
              <small style={{ fontSize: '12px', color: '#42e4c1', fontWeight: 500 }}>
                ({effectiveEfficiency}% SCORE)
              </small>
            </strong>
          </div>
          <div className="sliderrow">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Decrease efficiency"
              onClick={() => setEfficiency(efficiency - 5)}
            >
              <Minus size={14} />
            </Button>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[efficiency]}
              onValueChange={([value]) => setEfficiency(value)}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Increase efficiency"
              onClick={() => setEfficiency(efficiency + 5)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
        <span className="mode">
          {effectiveEfficiency < 60
            ? '● CONGESTED'
            : effectiveEfficiency > 90
            ? '● PEAK EFFICIENCY'
            : '● STEADY FLOW'}
        </span>
        <div className="speed">
          <Button
            aria-label={paused ? 'Resume simulation' : 'Pause simulation'}
            onClick={() => useWarehouseStore.getState().togglePause()}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </Button>
          {([1, 10, 60] as const).map((n) => (
            <Button
              key={n}
              aria-pressed={speed === n}
              className={speed === n ? 'on' : ''}
              onClick={() => useWarehouseStore.getState().setSpeed(n)}
            >
              {n}×
            </Button>
          ))}
        </div>
      </section>
      <div className="hints">
        DRAG TO ORBIT · RIGHT-DRAG TO PAN · SCROLL TO ZOOM · SELECT A ZONE TO FOCUS
      </div>
    </footer>
  );
}
