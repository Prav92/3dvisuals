'use client';
import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { Crosshair, Plus, Minus, Layers } from 'lucide-react';
import MetricsCard from './overlay/MetricsCard';
import ZoneStatusList from './overlay/ZoneStatusList';
import WorkforcePanel from './overlay/WorkforcePanel';
import EfficiencyController from './overlay/EfficiencyController';
import { useWarehouseSimulation } from '@/hooks/useWarehouseSimulation';
import { useWarehouseStore } from '@/store/useWarehouseStore';

const WarehouseScene = dynamic(() => import('./canvas/WarehouseScene'), {
  ssr: false,
  loading: () => <div className="scene-fallback">Loading warehouse…</div>,
});

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        Unable to initialize 3D graphics. Telemetry and controls remain available.
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function WarehouseDashboard() {
  useWarehouseSimulation();
  const [clock, setClock] = useState('—');

  useEffect(() => {
    const update = () =>
      setClock(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }) + ' IST');
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="world" aria-label="Interactive 3D warehouse">
        <SceneBoundary>
          <WarehouseScene />
        </SceneBoundary>
      </div>
      <header>
        <a className="brand" href="/">
          <Layers className="text-emerald-300" /> SimuLine
          <span className="divider" />
          <span className="subbrand">FULFILLMENT OBSERVATORY</span>
        </a>
        <div className="facility">
          CHENNAI · FC–01 <span className="dot" />
          <span>{clock}</span>
        </div>
      </header>
      <main>
        <MetricsCard />
        <div className="viewbadge">
          <span className="dot" /> DIGITAL TWIN <span>/</span> FLOOR 01
        </div>
        <div className="zones-column">
          <ZoneStatusList />
          <WorkforcePanel />
        </div>
        <div className="sceneheading">
          <span className="eyebrow">AUTOMATION, IN MOTION</span>
          <p>
            Chennai fulfillment center <span>01</span>
          </p>
        </div>
        <div className="viewtools">
          {(
            [
              { type: 'in', label: 'Zoom in', Icon: Plus },
              { type: 'out', label: 'Zoom out', Icon: Minus },
              { type: 'reset', label: 'Reset camera', Icon: Crosshair },
            ] as const
          ).map(({ type, label, Icon }) => (
            <button
              key={type}
              aria-label={label}
              onClick={() => useWarehouseStore.getState().camera(type)}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <EfficiencyController />
      </main>
    </>
  );
}
