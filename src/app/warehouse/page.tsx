import type { Metadata } from 'next';
import WarehouseDashboard from '@/components/WarehouseDashboard';
export const metadata: Metadata = { title: 'NEXUS | Warehouse Simulation', description: 'Warehouse digital twin with simulated logistics telemetry.' };
export default function Page() { return <WarehouseDashboard />; }
