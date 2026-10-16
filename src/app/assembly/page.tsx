import type { Metadata } from 'next';
import AssemblyDashboard from '@/components/assembly/AssemblyDashboard';

export const metadata: Metadata = {
  title: 'NEXUS | Automotive Assembly Line',
  description: 'Smart factory digital twin of an automotive assembly line with simulated robotics, QC and AGV telemetry.',
};

export default function Page() {
  return <AssemblyDashboard />;
}
