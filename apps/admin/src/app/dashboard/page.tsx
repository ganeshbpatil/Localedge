'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats { tenants: number; businesses: number; users: number }

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<string>('checking…');

  useEffect(() => {
    api.get('/health').then(r => setHealth(r.data.status === 'ok' ? '🟢 API Online' : '🔴 API Error')).catch(() => setHealth('🔴 API Unreachable'));
  }, []);

  const cards = [
    { label: 'API Status', value: health, color: '#22c55e' },
    { label: 'Platform', value: 'LocalEdge v1.0', color: '#6366f1' },
    { label: 'Environment', value: process.env['NODE_ENV'] ?? 'development', color: '#f59e0b' },
    { label: 'Role', value: 'SUPER_ADMIN', color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>Platform Overview</h1>
      <p style={{ color: '#94a3b8', marginBottom: 28, marginTop: 0, fontSize: 14 }}>India's AI-powered hyperlocal business growth platform</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 16, fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Quick Links</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '🔌 Configure Providers', href: '/dashboard/providers' },
            { label: '📱 Web App', href: 'http://145.223.18.59:8081', external: true },
            { label: '🔗 API Base', href: 'http://145.223.18.59:8083/api/v1/health', external: true },
          ].map(l => (
            <a key={l.label} href={l.href} target={l.external ? '_blank' : undefined} rel="noreferrer"
              style={{ padding: '9px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#a5b4fc', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
