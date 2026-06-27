'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface Tenant {
  name: string;
  slug: string;
  city: string;
  email: string;
  plan: string;
  status: string;
  businesses: number;
  mrr: string;
  gbp: boolean;
  wa: boolean;
  ai: boolean;
  joined: string;
}

const TENANTS: Tenant[] = [
  { name: 'Raj Foods Pvt Ltd', slug: 'raj-foods', city: 'Mumbai', email: 'owner@rajfoods.com', plan: 'GROWTH', status: 'Active', businesses: 12, mrr: '₹23,988', gbp: true, wa: true, ai: true, joined: 'Jan 2025' },
  { name: 'Krishna Textiles', slug: 'krishna-textiles', city: 'Surat', email: 'admin@krishnatex.com', plan: 'ENTERPRISE', status: 'Active', businesses: 28, mrr: '₹74,988', gbp: true, wa: true, ai: true, joined: 'Oct 2024' },
  { name: 'Meera Beauty Salons', slug: 'meera-salons', city: 'Delhi', email: 'meera@salons.in', plan: 'STARTER', status: 'Active', businesses: 5, mrr: '₹2,495', gbp: true, wa: true, ai: false, joined: 'Mar 2025' },
  { name: 'Om Electronics', slug: 'om-elec', city: 'Pune', email: 'info@omelec.com', plan: 'FREE', status: 'Trial', businesses: 2, mrr: '₹0', gbp: false, wa: false, ai: false, joined: 'Jun 2025' },
  { name: 'Star Multi-Speciality Clinic', slug: 'star-clinic', city: 'Chennai', email: 'admin@starclinic.in', plan: 'STARTER', status: 'Active', businesses: 3, mrr: '₹1,497', gbp: true, wa: true, ai: false, joined: 'Feb 2025' },
  { name: 'Bharat Jewellers', slug: 'bharat-jwl', city: 'Jaipur', email: 'contact@bharatjwl.com', plan: 'GROWTH', status: 'Active', businesses: 8, mrr: '₹15,992', gbp: true, wa: true, ai: true, joined: 'Dec 2024' },
  { name: 'Ananya Fashion Hub', slug: 'ananya-fash', city: 'Bengaluru', email: 'hello@ananyafash.com', plan: 'GROWTH', status: 'Suspended', businesses: 6, mrr: '₹0', gbp: true, wa: false, ai: true, joined: 'Nov 2024' },
  { name: 'Desi Dhabha Chain', slug: 'desi-dhabha', city: 'Hyderabad', email: 'ops@desidhabha.com', plan: 'PRO', status: 'Active', businesses: 18, mrr: '₹89,982', gbp: true, wa: true, ai: true, joined: 'Sep 2024' },
];

const planBadge: Record<string, BadgeVariant> = {
  FREE: 'gray', STARTER: 'blue', GROWTH: 'orange', PRO: 'purple', ENTERPRISE: 'green',
};
const statusBadge: Record<string, BadgeVariant> = {
  Active: 'green', Trial: 'yellow', Suspended: 'red',
};

function Chip({ on, label }: { on: boolean; label: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: on ? '#052e16' : '#1e293b', color: on ? '#4ade80' : '#475569', border: `1px solid ${on ? '#166534' : '#334155'}` }}>{label}</span>
  );
}

export default function TenantsPage() {
  const [search, setSearch] = useState('');

  const filtered = TENANTS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'Total', count: '2,847', color: '#f97316' },
          { label: 'Active', count: '2,341', color: '#22c55e' },
          { label: 'Trial', count: '312', color: '#eab308' },
          { label: 'Suspended', count: '148', color: '#ef4444' },
          { label: 'Churned', count: '46', color: '#64748b' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color }}>{count}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Search + Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city, or email…"
            style={{ paddingLeft: 32, width: '100%' }}
          />
        </div>
        <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 7, color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Filter ▾</button>
        <button style={{ padding: '8px 16px', background: '#f97316', border: 'none', borderRadius: 7, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ New Tenant</button>
      </div>

      {/* Table */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Name / Slug', 'City', 'Owner Email', 'Plan', 'Status', 'Biz', 'MRR', 'Integrations', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>@{t.slug}</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{t.city}</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{t.email}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant={planBadge[t.plan] ?? 'gray'}>{t.plan}</Badge></td>
                <td style={{ padding: '12px 14px' }}><Badge variant={statusBadge[t.status] ?? 'gray'}>{t.status}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 600 }}>{t.businesses}</td>
                <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: 600 }}>{t.mrr}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Chip on={t.gbp} label="GBP" />
                    <Chip on={t.wa} label="WA" />
                    <Chip on={t.ai} label="AI" />
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{t.joined}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>View</button>
                    <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#64748b' }}>
        <span>Showing 1–8 of 2,847 tenants</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['‹ Prev', '1', '2', '3', '...', '356', 'Next ›'].map((p, idx) => (
            <button key={idx} style={{ padding: '5px 10px', background: p === '1' ? '#f97316' : 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: p === '1' ? '#fff' : '#94a3b8', fontSize: 12, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
