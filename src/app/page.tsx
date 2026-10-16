import Link from 'next/link';

const simulations = [
  { href: '/warehouse', name: 'Warehouse Fulfillment', blurb: 'AGV fleet, high-bay racking and loading docks' },
  { href: '/assembly', name: 'Automotive Assembly Line', blurb: 'Robotic welding, QC scanning and live line metrics' },
];

export default function Page() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0d1b27', color: '#e6f1f5', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>NEXUS Simulations</h1>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 14 }}>
          {simulations.map((sim) => (
            <li key={sim.href}>
              <Link href={sim.href} style={{ color: '#57ffcf', fontSize: 18 }}>{sim.name} →</Link>
              <div style={{ color: '#8295a7', fontSize: 12, marginTop: 4 }}>{sim.blurb}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
