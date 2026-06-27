'use client';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

const PLANS = [
  { name: 'FREE', price: '₹0', tenants: 1195, features: ['1 Business', '50 Reviews/mo', 'No WhatsApp', 'No AI'], color: '#64748b' },
  { name: 'STARTER', price: '₹499', tenants: 882, features: ['5 Businesses', '500 Reviews/mo', '1K WA msgs', 'Basic AI'], color: '#3b82f6' },
  { name: 'GROWTH', price: '₹1,999', tenants: 512, features: ['15 Businesses', '2K Reviews/mo', '5K WA msgs', 'Full AI'], color: '#f97316' },
  { name: 'PRO', price: '₹4,999', tenants: 170, features: ['50 Businesses', '10K Reviews/mo', '20K WA msgs', 'Priority AI'], color: '#8b5cf6' },
  { name: 'ENTERPRISE', price: 'Custom', tenants: 88, features: ['Unlimited', 'Unlimited Reviews', 'Unlimited WA', 'Dedicated AI'], color: '#22c55e' },
];

const SUBSCRIPTIONS = [
  { tenant: 'Raj Foods Pvt Ltd', plan: 'GROWTH', mrr: '₹23,988', status: 'Active', since: 'Jan 2025', nextBill: 'Jul 2025' },
  { tenant: 'Krishna Textiles', plan: 'ENTERPRISE', mrr: '₹74,988', status: 'Active', since: 'Oct 2024', nextBill: 'Jul 2025' },
  { tenant: 'Meera Beauty Salons', plan: 'STARTER', mrr: '₹2,495', status: 'Active', since: 'Mar 2025', nextBill: 'Jul 2025' },
  { tenant: 'Star Multi-Speciality Clinic', plan: 'STARTER', mrr: '₹1,497', status: 'Active', since: 'Feb 2025', nextBill: 'Jul 2025' },
  { tenant: 'Bharat Jewellers', plan: 'GROWTH', mrr: '₹15,992', status: 'Active', since: 'Dec 2024', nextBill: 'Jul 2025' },
  { tenant: 'Desi Dhabha Chain', plan: 'PRO', mrr: '₹89,982', status: 'Active', since: 'Sep 2024', nextBill: 'Jul 2025' },
  { tenant: 'Ananya Fashion Hub', plan: 'GROWTH', mrr: '₹0', status: 'Suspended', since: 'Nov 2024', nextBill: '—' },
  { tenant: 'Om Electronics', plan: 'FREE', mrr: '₹0', status: 'Trial', since: 'Jun 2025', nextBill: 'Jul 2025' },
];

const planBadge: Record<string, BadgeVariant> = {
  FREE: 'gray', STARTER: 'blue', GROWTH: 'orange', PRO: 'purple', ENTERPRISE: 'green',
};
const statusBadge: Record<string, BadgeVariant> = {
  Active: 'green', Trial: 'yellow', Suspended: 'red',
};

export default function SubscriptionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Revenue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Monthly Recurring Revenue" value="₹58.4L" sub="+12% MoM" color="#22c55e" icon="💰" />
        <StatCard label="Annual Run Rate" value="₹7.0 Cr" sub="ARR projection" color="#f97316" icon="📈" />
        <StatCard label="Paying Tenants" value="1,647" sub="58% of all tenants" color="#3b82f6" icon="💳" />
        <StatCard label="ARPU" value="₹3,545" sub="Average per tenant" color="#8b5cf6" icon="🎯" />
      </div>

      {/* Plan Cards */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 14px' }}>Plan Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: '#0f1521', border: `1px solid ${p.color}40`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: '0.5px', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>{p.price}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>/month</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: p.color, marginBottom: 2 }}>{p.tenants.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>tenants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {p.features.map(f => (
                  <div key={f} style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: p.color }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Recent Subscriptions</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Tenant', 'Plan', 'MRR', 'Status', 'Since', 'Next Billing', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBSCRIPTIONS.map((s, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f1f5f9' }}>{s.tenant}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant={planBadge[s.plan] ?? 'gray'}>{s.plan}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: 600 }}>{s.mrr}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant={statusBadge[s.status] ?? 'gray'}>{s.status}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{s.since}</td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{s.nextBill}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>Manage</button>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
