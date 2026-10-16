import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Fulfillment Observatory', description: 'Warehouse digital twin with simulated logistics telemetry.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
