'use client';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

const STATS = [
  { label: 'Total Tenants', value: '2,847', sub: '+48 this month', color: '#f97316', icon: '🏢' },
  { label: 'Active Businesses', value: '14,382', sub: '+234 this week', color: '#3b82f6', icon: '🏪' },
  { label: 'Monthly Revenue', value: '₹58.4L', sub: '+12% MoM', color: '#22c55e', icon: '💰' },
  { label: 'AI Tokens Today', value: '4.2M', sub: 'Across all LLMs', color: '#8b5cf6', icon: '🤖' },
  { label: 'WhatsApp Sent', value: '89,420', sub: 'Last 24 hours', color: '#06b6d4', icon: '💬' },
  { label: 'Reviews Replied', value: '12,847', sub: 'Auto-replied today', color: '#eab308', icon: '⭐' },
  { label: 'Total Users', value: '31,290', sub: 'Platform-wide', color: '#ec4899', icon: '👥' },
  { label: 'Platform Uptime', value: '99.98%', sub: 'Last 30 days', color: '#22c55e', icon: '📡' },
];

const RECENT_TENANTS = [
  { name: 'Raj Foods Pvt Ltd', city: 'Mumbai', plan: 'GROWTH', businesses: 12, status: 'Active' },
  { name: 'Krishna Textiles', city: 'Surat', plan: 'ENTERPRISE', businesses: 28, status: 'Active' },
  { name: 'Meera Salons', city: 'Delhi', plan: 'STARTER', businesses: 5, status: 'Active' },
  { name: 'Om Electronics', city: 'Pune', plan: 'FREE', businesses: 2, status: 'Trial' },
  { name: 'Star Clinic', city: 'Chennai', plan: 'STARTER', businesses: 3, status: 'Active' },
];

const PLAN_DIST = [
  { plan: 'FREE', pct: 42, color: '#64748b' },
  { plan: 'STARTER', pct: 31, color: '#3b82f6' },
  { plan: 'GROWTH', pct: 18, color: '#f97316' },
  { plan: 'PRO', pct: 6, color: '#8b5cf6' },
  { plan: 'ENTERPRISE', pct: 3, color: '#22c55e' },
];

const HEALTH = [
  { name: 'API Server', uptime: '99.9%', latency: '12ms', status: 'green' },
  { name: 'PostgreSQL', uptime: '99.8%', latency: '3ms', status: 'green' },
  { name: 'Redis', uptime: '100%', latency: '<1ms', status: 'green' },
  { name: 'MongoDB', uptime: '99.7%', latency: '8ms', status: 'green' },
  { name: 'Elasticsearch', uptime: '98.2%', latency: '45ms', status: 'yellow' },
  { name: 'BullMQ', uptime: '99.5%', latency: '—', status: 'green' },
  { name: 'WhatsApp Engine', uptime: '97.8%', latency: '—', status: 'yellow' },
  { name: 'AI Gateway', uptime: '99.9%', latency: '220ms', status: 'green' },
];

const AI_GATEWAY = [
  { provider: 'OpenAI', calls: 1284, tokens: '2.1M', cost: '₹3,240' },
  { provider: 'Anthropic', calls: 892, tokens: '842K', cost: '₹2,180' },
  { provider: 'Gemini', calls: 1647, tokens: '4.2M', cost: '₹890' },
  { provider: 'Groq', calls: 340, tokens: '380K', cost: '₹120' },
];

const QUEUES = [
  { name: 'review-reply', waiting: 0, active: 2, completed: 8420, failed: 3 },
  { name: 'wa-campaign', waiting: 5, active: 1, completed: 12840, failed: 12 },
  { name: 'wa-trigger', waiting: 12, active: 8, completed: 89420, failed: 89 },
  { name: 'analytics', waiting: 0, active: 1, completed: 31290, failed: 0 },
  { name: 'webhooks', waiting: 2, active: 3, completed: 4820, failed: 48 },
  { name: 'notifications', waiting: 8, active: 2, completed: 28400, failed: 12 },
];

const planBadge: Record<string, BadgeVariant> = {
  FREE: 'gray', STARTER: 'blue', GROWTH: 'orange', PRO: 'purple', ENTERPRISE: 'green',
};
const statusBadge: Record<string, BadgeVariant> = {
  Active: 'green', Trial: 'yellow', Suspended: 'red',
};

const S = { card: { background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties };

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Row 2: Recent Tenants + Plan Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Recent Tenants */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Recent Tenants</h2>
            <a href="/dashboard/tenants" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none' }}>View all →</a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>City</th>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Plan</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Biz</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TENANTS.map((t, i) => (
                <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 0', color: '#f1f5f9', fontWeight: 500 }}>{t.name}</td>
                  <td style={{ padding: '10px 0', color: '#94a3b8' }}>{t.city}</td>
                  <td style={{ padding: '10px 0' }}><Badge variant={planBadge[t.plan] ?? 'gray'}>{t.plan}</Badge></td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#94a3b8' }}>{t.businesses}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}><Badge variant={statusBadge[t.status] ?? 'gray'}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Plan Distribution */}
        <div style={S.card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Plan Distribution</h2>
          {PLAN_DIST.map(p => (
            <div key={p.plan} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: '#94a3b8', fontWeight: 500 }}>{p.plan}</span>
                <span style={{ color: p.color, fontWeight: 700 }}>{p.pct}%</span>
              </div>
              <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: System Health + AI Gateway */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* System Health */}
        <div style={S.card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>System Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HEALTH.map(h => (
              <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#07090f', borderRadius: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.status === 'green' ? '#22c55e' : '#eab308', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: '#f1f5f9' }}>{h.name}</span>
                <span style={{ fontSize: 12, color: '#64748b', width: 55, textAlign: 'right' }}>{h.latency}</span>
                <span style={{ fontSize: 12, color: h.status === 'green' ? '#22c55e' : '#eab308', fontWeight: 600, width: 52, textAlign: 'right' }}>{h.uptime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Gateway Today */}
        <div style={S.card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>AI Gateway — Today</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Provider</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Calls</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Tokens</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {AI_GATEWAY.map((g, i) => (
                <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 0', color: '#f1f5f9', fontWeight: 500 }}>{g.provider}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#94a3b8' }}>{g.calls.toLocaleString()}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#94a3b8' }}>{g.tokens}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>{g.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Total</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>₹6,430</span>
          </div>
        </div>
      </div>

      {/* BullMQ Queue Status */}
      <div style={S.card}>
        <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>BullMQ Queue Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {QUEUES.map(q => (
            <div key={q.name} style={{ background: '#07090f', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', fontFamily: 'monospace', marginBottom: 10 }}>{q.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { l: 'Waiting', v: q.waiting, c: q.waiting > 0 ? '#eab308' : '#64748b' },
                  { l: 'Active', v: q.active, c: '#3b82f6' },
                  { l: 'Completed', v: q.completed.toLocaleString(), c: '#22c55e' },
                  { l: 'Failed', v: q.failed, c: q.failed > 0 ? '#ef4444' : '#64748b' },
                ].map(({ l, v, c }) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
