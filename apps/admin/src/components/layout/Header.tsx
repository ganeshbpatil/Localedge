'use client';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/tenants': 'Tenants',
  '/dashboard/businesses': 'Businesses',
  '/dashboard/subscriptions': 'Subscriptions',
  '/dashboard/providers': 'Provider Configuration',
  '/dashboard/ai-gateway': 'AI Gateway',
  '/dashboard/webhooks': 'Webhooks',
  '/dashboard/feature-flags': 'Feature Flags',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/audit-logs': 'Audit Logs',
  '/dashboard/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Admin';
  return (
    <header style={{ height: 56, background: '#0a0f1a', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0 }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, flex: 1 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f1521', border: '1px solid #1e293b', borderRadius: 8, padding: '6px 12px', width: 240 }}>
        <span style={{ color: '#475569' }}>🔍</span>
        <input type="text" placeholder="Search…" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 13, width: '100%', padding: 0 }} />
      </div>
      <button style={{ padding: '6px 10px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 7, color: '#94a3b8', cursor: 'pointer', fontSize: 15 }}>↻</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e' }}>
        <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} /> System Online
      </div>
    </header>
  );
}
