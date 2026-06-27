'use client';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface Webhook {
  name: string;
  url: string;
  events: string[];
  status: string;
  deliveries: number;
  lastTriggered: string;
}

interface Delivery {
  webhook: string;
  event: string;
  status: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
}

const WEBHOOKS: Webhook[] = [
  { name: 'CRM Integration', url: 'https://crm.example.com/webhook', events: ['review.created', 'review.replied'], status: 'Active', deliveries: 4820, lastTriggered: '2 min ago' },
  { name: 'Slack Notifications', url: 'https://hooks.slack.com/services/T0000/B0000/xxx', events: ['tenant.suspended', 'payment.failed'], status: 'Active', deliveries: 234, lastTriggered: '1 hr ago' },
  { name: 'Analytics Sync', url: 'https://analytics.example.com/ingest', events: ['review.created', 'business.updated'], status: 'Active', deliveries: 18240, lastTriggered: '30 sec ago' },
  { name: 'Payment Logger', url: 'https://finance.example.com/log', events: ['subscription.created', 'payment.succeeded', 'payment.failed'], status: 'Active', deliveries: 1647, lastTriggered: '5 min ago' },
  { name: 'Ops Alert System', url: 'https://ops.example.com/alert', events: ['system.error', 'tenant.suspended'], status: 'Inactive', deliveries: 48, lastTriggered: '2 days ago' },
];

const DELIVERIES: Delivery[] = [
  { webhook: 'CRM Integration', event: 'review.created', status: 'Success', statusCode: 200, latencyMs: 243, timestamp: '2 min ago' },
  { webhook: 'Analytics Sync', event: 'review.created', status: 'Success', statusCode: 200, latencyMs: 89, timestamp: '2 min ago' },
  { webhook: 'Analytics Sync', event: 'business.updated', status: 'Success', statusCode: 201, latencyMs: 112, timestamp: '5 min ago' },
  { webhook: 'Payment Logger', event: 'payment.succeeded', status: 'Success', statusCode: 200, latencyMs: 340, timestamp: '5 min ago' },
  { webhook: 'Slack Notifications', event: 'payment.failed', status: 'Failed', statusCode: 503, latencyMs: 5000, timestamp: '1 hr ago' },
  { webhook: 'CRM Integration', event: 'review.replied', status: 'Success', statusCode: 200, latencyMs: 289, timestamp: '1 hr ago' },
  { webhook: 'Analytics Sync', event: 'review.created', status: 'Success', statusCode: 200, latencyMs: 95, timestamp: '2 hr ago' },
  { webhook: 'Payment Logger', event: 'subscription.created', status: 'Retrying', statusCode: 408, latencyMs: 3000, timestamp: '3 hr ago' },
];

const statusBadge: Record<string, BadgeVariant> = {
  Active: 'green', Inactive: 'gray', Success: 'green', Failed: 'red', Retrying: 'yellow',
};

export default function WebhooksPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Active Webhooks */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Active Webhooks</h2>
          <button style={{ padding: '7px 14px', background: '#f97316', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Webhook</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Name', 'Endpoint URL', 'Events', 'Status', 'Deliveries', 'Last Triggered', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEBHOOKS.map((w, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f1f5f9' }}>{w.name}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: '#64748b', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.url}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {w.events.map(e => <Badge key={e} variant="blue">{e}</Badge>)}
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}><Badge variant={statusBadge[w.status] ?? 'gray'}>{w.status}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{w.deliveries.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{w.lastTriggered}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>Test</button>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #ef4444', borderRadius: 5, color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Deliveries */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Recent Deliveries</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Webhook', 'Event', 'Status', 'Code', 'Latency', 'Time'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DELIVERIES.map((d, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 500 }}>{d.webhook}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: '#f97316' }}>{d.event}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant={statusBadge[d.status] ?? 'gray'}>{d.status}</Badge></td>
                <td style={{ padding: '12px 14px', color: d.statusCode < 300 ? '#22c55e' : '#ef4444', fontFamily: 'monospace', fontWeight: 700 }}>{d.statusCode}</td>
                <td style={{ padding: '12px 14px', color: d.latencyMs > 1000 ? '#ef4444' : '#94a3b8' }}>{d.latencyMs}ms</td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{d.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
