# SimuLine Fulfillment Observatory

A Next.js App Router / React 19 / TypeScript warehouse digital twin. Three.js runs through React Three Fiber 9, with drei orthographic camera, CameraControls, world-space HTML labels, instanced racking, spline-driven AGVs and conveyor parcels, and subtle emissive bloom. The HUD uses Tailwind CSS 4, local shadcn-style Radix controls, Lucide icons and Recharts. Zustand manages selection, camera commands and simulation controls. GSAP handles responsive camera zoom transitions.

## Run

Requires Node.js 22+ and npm. From this directory:

```sh
npm ci
npm run dev
```

Open http://localhost:4173. For the optimized static build:

```sh
npm run build
npm start
```

The Next.js static export is written to `out/`; the hosting manifest points there. `dist/` is retained as the original legacy reference, not the active application. No hosted deployment is performed by these commands.

## Validation

```sh
npm run check
npm test
npm run build
npm audit
```

## Architecture

- `src/app`: App Router server entry, layout and Tailwind styles.
- `src/components/canvas`: client-only WebGL scene, instanced racks, floor, loading docks, AGV fleet and conveyor loop.
- `src/components/overlay`: metrics, floor activity, efficiency and time controls.
- `src/components/ui`: editable Radix/shadcn-style button and slider components; `components.json` configures shadcn additions.
- `src/store/useWarehouseStore.ts`: typed Zustand state and actions.
- `src/hooks/useWarehouseSimulation.ts`: 250 ms local telemetry ticks with cleanup.
- `src/lib/simulation.ts`: telemetry math and picking/transit/queuing/offloading phases.
- `public/models`: documented Blender → compressed GLB → gltfjsx workflow. The current geometry is procedural; no GLB assets were supplied.

The efficiency range is 0–100%; 1x/10x/60x and pause control telemetry and motion. Frame-loop animation reads the store directly without React frame updates. Short frame/tick deltas are capped to avoid background-tab catch-up jumps. Chart history is bounded to 60 points. Low efficiency triggers queues and alerts; recovery clears them. Camera selection focuses racks, sortation or individual docks; reset returns to the floor overview. Drag to orbit, right-drag to pan, scroll to zoom.

## Demo versus production

All telemetry, occupancy and operational statuses are simulated. The waypoint logic models demo handling phases, not collision avoidance, real routing or industrial physics. Production MQTT/OPC-UA gateways, authenticated WebSocket/SSE streaming and InfluxDB/TimescaleDB history are future integrations, not implemented services. Add a validated telemetry adapter to update Zustand and disable local ticks when connected to real data. Keep industrial credentials and protocol connections in the gateway, outside the browser. A server-backed Next.js deployment must remove `output: 'export'` before adding server routes.

The sharp override selects a patched image-processing release for the gltfjsx asset pipeline. Recheck the override and generated model output when upgrading asset tooling.
