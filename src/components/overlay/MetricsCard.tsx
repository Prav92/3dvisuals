import { Activity, Bot, Users } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { OPTIMAL_WORKERS } from '@/lib/simulation';

export default function MetricsCard() {
  const metrics = useWarehouseStore((s) => s.metrics);
  const history = useWarehouseStore((s) => s.history);
  const alerts = useWarehouseStore((s) => s.systemAlerts);

  return (
    <section className="panel metrics">
      <div className="eyebrow">
        LOGISTICS &amp; FULFILLMENT METRICS <span className="live">● LIVE SIM</span>
      </div>
      <h1>Every movement.<br />In sync.</h1>
      <p className="muted">A real-time view of your fulfillment floor.</p>

      <div className="primary">
        <span>THROUGHPUT</span>
        <strong>{Math.round(metrics.throughput)}<span>%</span></strong>
      </div>

      <div className="meter">
        <i style={{ width: metrics.throughput + '%' }} />
      </div>

      <div className="h-12" role="img" aria-label="Recent simulated throughput trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <YAxis hide domain={[0, 100]} />
            <Area dataKey="throughput" stroke="#42e4c1" fill="#42e4c130" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="statgrid">
        <div>
          <label>ORDERS DISPATCHED</label>
          <strong>{metrics.ordersPerHour.toLocaleString('en-US')}<small>/hr</small></strong>
          <span className="trend">↗ Simulated capacity</span>
        </div>
        <div>
          <label>BOTTLENECKS</label>
          <strong>{alerts.length}</strong>
          <span className="muted">Queue: {metrics.queueCount}</span>
        </div>
      </div>

      <div className="fleet">
        <span className="flex items-center gap-2"><Bot size={14} /> ACTIVE AGVs</span>
        <strong>{metrics.activeAGVs} <small>/ 40</small></strong>
      </div>

      <div className="fleet crew-stat">
        <span className="flex items-center gap-2"><Users size={14} /> ACTIVE CREW</span>
        <strong>{metrics.activeWorkers} <small>/ {OPTIMAL_WORKERS}</small></strong>
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-400">
        <span className="flex gap-2"><Activity size={14} /> Overall equipment effectiveness</span>
        <span>{metrics.oee.toFixed(1)}%</span>
      </div>
    </section>
  );
}
