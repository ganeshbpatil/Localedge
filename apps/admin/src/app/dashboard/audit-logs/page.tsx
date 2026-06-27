'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  resource: string;
  detail: string;
  ip: string;
  timestamp: string;
  severity: string;
}

const LOGS: AuditLog[] = [
  { id: 'al-001', action: 'TENANT_SUSPENDED', actor: 'admin@localedge.in', resource: 'Tenant: ananya-fash', detail: 'Suspended for payment failure after 3 retries', ip: '103.21.58.12', timestamp: '2025-06-27 14:32:01', severity: 'high' },
  { id: 'al-002', action: 'PROVIDER_CONFIG_UPDATED', actor: 'admin@localedge.in', resource: 'AI Provider: OpenAI', detail: 'API key rotated for security', ip: '103.21.58.12', timestamp: '2025-06-27 13:18:44', severity: 'medium' },
  { id: 'al-003', action: 'FEATURE_FLAG_TOGGLED', actor: 'admin@localedge.in', resource: 'Flag: ai_chat_assistant', detail: 'Disabled — rolled back to 0%', ip: '103.21.58.12', timestamp: '2025-06-27 12:45:22', severity: 'medium' },
  { id: 'al-004', action: 'ADMIN_LOGIN', actor: 'admin@localedge.in', resource: 'Auth', detail: 'Successful login from new IP', ip: '103.21.58.12', timestamp: '2025-06-27 12:00:00', severity: 'low' },
  { id: 'al-005', action: 'PLAN_UPGRADED', actor: 'system', resource: 'Tenant: raj-foods', detail: 'Upgraded STARTER → GROWTH via payment', ip: '0.0.0.0', timestamp: '2025-06-27 11:22:15', severity: 'info' },
  { id: 'al-006', action: 'WEBHOOK_DELETED', actor: 'admin@localedge.in', resource: 'Webhook: Ops Alert System', detail: 'Removed outdated webhook endpoint', ip: '103.21.58.12', timestamp: '2025-06-27 10:58:33', severity: 'medium' },
  { id: 'al-007', action: 'BULK_WA_CAMPAIGN_SENT', actor: 'system', resource: 'Tenant: desi-dhabha (18 biz)', detail: '89,420 WhatsApp messages dispatched', ip: '0.0.0.0', timestamp: '2025-06-27 10:00:00', severity: 'info' },
  { id: 'al-008', action: 'PAYMENT_FAILED', actor: 'system', resource: 'Tenant: ananya-fash', detail: 'Razorpay charge failed — insufficient funds', ip: '0.0.0.0', timestamp: '2025-06-27 09:45:11', severity: 'high' },
  { id: 'al-009', action: 'TENANT_CREATED', actor: 'self-signup', resource: 'Tenant: om-elec', detail: 'New tenant self-registered on FREE plan', ip: '117.220.113.5', timestamp: '2025-06-27 09:30:00', severity: 'info' },
  { id: 'al-010', action: 'ROUTING_RULE_UPDATED', actor: 'admin@localedge.in', resource: 'AI Gateway: review_auto_reply', detail: 'Changed primary model to GPT-4o-mini', ip: '103.21.58.12', timestamp: '2025-06-27 08:20:55', severity: 'medium' },
  { id: 'al-011', action: 'API_KEY_ROTATED', actor: 'admin@localedge.in', resource: 'Provider: Razorpay', detail: 'Monthly scheduled key rotation', ip: '103.21.58.12', timestamp: '2025-06-27 07:00:00', severity: 'medium' },
  { id: 'al-012', action: 'SYSTEM_ERROR', actor: 'system', resource: 'Elasticsearch', detail: 'Cluster health yellow — shard rebalancing', ip: '0.0.0.0', timestamp: '2025-06-27 06:12:40', severity: 'high' },
];

const severityBadge: Record<string, BadgeVariant> = {
  high: 'red', medium: 'yellow', low: 'blue', info: 'gray',
};

const ACTION_COLORS: Record<string, string> = {
  TENANT_SUSPENDED: '#ef4444', PAYMENT_FAILED: '#ef4444', SYSTEM_ERROR: '#ef4444',
  PROVIDER_CONFIG_UPDATED: '#eab308', FEATURE_FLAG_TOGGLED: '#eab308', ROUTING_RULE_UPDATED: '#eab308',
  WEBHOOK_DELETED: '#eab308', API_KEY_ROTATED: '#eab308',
  ADMIN_LOGIN: '#3b82f6', PLAN_UPGRADED: '#22c55e', TENANT_CREATED: '#22c55e',
  BULK_WA_CAMPAIGN_SENT: '#8b5cf6',
};

const FILTERS = ['All Actions', 'TENANT_SUSPENDED', 'PROVIDER_CONFIG_UPDATED', 'FEATURE_FLAG_TOGGLED', 'ADMIN_LOGIN', 'PAYMENT_FAILED', 'SYSTEM_ERROR'];

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Actions');

  const visible = LOGS.filter(l => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All Actions' || l.action === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" style={{ paddingLeft: 32 }} />
        </div>
        <button style={{ padding: '8px 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 7, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
          📥 Export CSV
        </button>
      </div>

      {/* Action filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', borderColor: filter === f ? '#f97316' : '#1e293b', background: filter === f ? 'rgba(249,115,22,0.15)' : 'transparent', color: filter === f ? '#f97316' : '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            {f === 'All Actions' ? f : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['ID', 'Action', 'Actor', 'Resource', 'Detail', 'IP', 'Severity', 'Timestamp'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((l, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{l.id}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: ACTION_COLORS[l.action] ?? '#f97316' }}>
                    {l.action}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 11 }}>{l.actor}</td>
                <td style={{ padding: '10px 14px', color: '#f1f5f9', fontSize: 11 }}>{l.resource}</td>
                <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11, maxWidth: 220 }}>{l.detail}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{l.ip}</td>
                <td style={{ padding: '10px 14px' }}><Badge variant={severityBadge[l.severity] ?? 'gray'}>{l.severity}</Badge></td>
                <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #1e293b', fontSize: 12, color: '#64748b' }}>
          Showing {visible.length} of {LOGS.length} entries
        </div>
      </div>
    </div>
  );
}
