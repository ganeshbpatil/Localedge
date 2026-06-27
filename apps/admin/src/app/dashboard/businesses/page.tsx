'use client';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface Business {
  name: string;
  tenant: string;
  category: string;
  city: string;
  status: string;
  reviews: number;
  rating: string;
  gbp: boolean;
  wa: boolean;
  created: string;
}

const BUSINESSES: Business[] = [
  { name: 'Raj Biryani House', tenant: 'Raj Foods', category: 'Restaurant', city: 'Andheri, Mumbai', status: 'Active', reviews: 1240, rating: '4.6 ⭐', gbp: true, wa: true, created: 'Jan 2025' },
  { name: 'Raj Dhaba Express', tenant: 'Raj Foods', category: 'Restaurant', city: 'Bandra, Mumbai', status: 'Active', reviews: 890, rating: '4.4 ⭐', gbp: true, wa: true, created: 'Feb 2025' },
  { name: 'Krishna Silks', tenant: 'Krishna Textiles', category: 'Retail', city: 'Surat Main', status: 'Active', reviews: 2100, rating: '4.8 ⭐', gbp: true, wa: true, created: 'Oct 2024' },
  { name: 'Meera Hair Studio', tenant: 'Meera Salons', category: 'Beauty & Spa', city: 'Connaught Place, Delhi', status: 'Active', reviews: 540, rating: '4.3 ⭐', gbp: true, wa: true, created: 'Mar 2025' },
  { name: 'Om Mobile World', tenant: 'Om Electronics', category: 'Electronics', city: 'FC Road, Pune', status: 'Active', reviews: 120, rating: '3.9 ⭐', gbp: false, wa: false, created: 'Jun 2025' },
  { name: 'Star Orthopaedics', tenant: 'Star Clinic', category: 'Healthcare', city: 'Anna Nagar, Chennai', status: 'Active', reviews: 780, rating: '4.7 ⭐', gbp: true, wa: true, created: 'Feb 2025' },
  { name: 'Bharat Diamond House', tenant: 'Bharat Jewellers', category: 'Jewellery', city: 'MI Road, Jaipur', status: 'Active', reviews: 1680, rating: '4.9 ⭐', gbp: true, wa: true, created: 'Dec 2024' },
  { name: 'Ananya Boutique', tenant: 'Ananya Fashion Hub', category: 'Fashion', city: 'Koramangala, Bengaluru', status: 'Suspended', reviews: 340, rating: '4.1 ⭐', gbp: true, wa: false, created: 'Nov 2024' },
  { name: 'Desi Dhabha Secunderabad', tenant: 'Desi Dhabha Chain', category: 'Restaurant', city: 'Secunderabad, Hyd', status: 'Active', reviews: 3200, rating: '4.5 ⭐', gbp: true, wa: true, created: 'Sep 2024' },
  { name: 'Desi Dhabha Banjara Hills', tenant: 'Desi Dhabha Chain', category: 'Restaurant', city: 'Banjara Hills, Hyd', status: 'Active', reviews: 2890, rating: '4.6 ⭐', gbp: true, wa: true, created: 'Sep 2024' },
];

const statusBadge: Record<string, BadgeVariant> = { Active: 'green', Suspended: 'red', Inactive: 'gray' };

function Chip({ on, label }: { on: boolean; label: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: on ? '#052e16' : '#1e293b', color: on ? '#4ade80' : '#475569', border: `1px solid ${on ? '#166534' : '#334155'}` }}>{label}</span>
  );
}

export default function BusinessesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Businesses" value="14,382" sub="+234 this week" color="#3b82f6" icon="🏪" />
        <StatCard label="GBP Connected" value="8,234" sub="57% of total" color="#22c55e" icon="🗺️" />
        <StatCard label="WA Connected" value="6,891" sub="48% of total" color="#25d366" icon="💬" />
        <StatCard label="Avg Rating" value="4.2 ⭐" sub="Platform average" color="#eab308" icon="⭐" />
      </div>

      {/* Table */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>All Businesses</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Search businesses…" style={{ width: 220 }} />
            <button style={{ padding: '7px 14px', background: '#f97316', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Business</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Business', 'Tenant', 'Category', 'City', 'Status', 'Reviews', 'Rating', 'GBP', 'WA', 'Created'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUSINESSES.map((b, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f1f5f9' }}>{b.name}</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{b.tenant}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant="blue">{b.category}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{b.city}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant={statusBadge[b.status] ?? 'gray'}>{b.status}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 600 }}>{b.reviews.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: '#eab308' }}>{b.rating}</td>
                <td style={{ padding: '12px 14px' }}><Chip on={b.gbp} label="GBP" /></td>
                <td style={{ padding: '12px 14px' }}><Chip on={b.wa} label="WA" /></td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>{b.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #1e293b', fontSize: 12, color: '#64748b' }}>
          Showing 1–10 of 14,382 businesses
        </div>
      </div>
    </div>
  );
}
