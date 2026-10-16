'use client';
import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import { ControlBar, MetricsPanel, SectorPanel, TopBar, WorkforcePanel } from './AssemblyHud';
import { useAssemblySimulation } from '@/hooks/useAssemblySimulation';
import './assembly.css';

const AssemblyScene = dynamic(() => import('./AssemblyScene'), { ssr: false, loading: () => <div className="asm-fallback">Loading assembly line…</div> });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="asm-fallback">Unable to initialize 3D graphics. Telemetry and controls remain available.</div> : this.props.children;
  }
}

export default function AssemblyDashboard() {
  useAssemblySimulation();
  return (
    <div className="asm-root">
      <div className="asm-world" aria-label="Interactive 3D automotive assembly line">
        <SceneBoundary>
          <AssemblyScene />
        </SceneBoundary>
      </div>
      <TopBar />
      <MetricsPanel />
      <div className="asm-right">
        <SectorPanel />
        <WorkforcePanel />
      </div>
      <ControlBar />
    </div>
  );
}
