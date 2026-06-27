'use client';
import { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const DAILY_DATA = [
  { day: 'Jun 21', tenants: 2790, reviews: 8420, revenue: 1840000, tokens: 3200000 },
  { day: 'Jun 22', tenants: 2801, reviews: 9120, revenue: 1920000, tokens: 3800000 },
  { day: 'Jun 23', tenants: 2812, reviews: 8780, revenue: 1870000, tokens: 3500000 },
  { day: 'Jun 24', tenants: 2820, reviews: 10240, revenue: 2010000, tokens: 4100000 },
  { day: 'Jun 25', tenants: 2831, reviews: 9840, revenue: 1980000, tokens: 3900000 },
  { day: 'Jun 26', tenants: 2839, reviews: 11020, revenue: 2120000, tokens: 4300000 },
  { day: 'Jun 27', tenants: 2847, reviews: 12847, revenue: 1940000, tokens: 4200000 },
];

const MONTHLY_DATA = [
  { month: 'Jan', mrr: 4200000, tenants: 1840, churn: 12 },
  { month: 'Feb', mrr: 4680000, tenants: 2010, churn: 18 },
  { month: 'Mar', mrr: 5120000, tenants: 2230, churn: 14 },
  { month: 'Apr', mrr: 5480000, tenants: 2410, churn: 22 },
  { month: 'May', mrr: 5840000, tenants: 2620, churn: 19 },
  { month: 'Jun', mrr: 5840000, tenants: 2847, churn: 11 },
];

const TOP_TENANTS = [
  { name: 'Desi Dhabha Chain', mrr: '₹89,982', businesses: 18, reviews: 28400, ai: 4200 },
  { name: 'Krishna Textiles', mrr: '₹74,988', businesses: 28, reviews: 18200, ai: 2800 },
  { name: 'Raj Foods Pvt Ltd', mrr: '₹23,988', businesses: 12, reviews: 14200, ai: 1840 },
  { name: 'Bharat Jewellers', mrr: '₹15,992', businesses: 8, reviews: 9800, ai: 1240 },
  { name: 'Star Multi-Speciality Clinic', mrr: '₹1,497', businesses: 3, reviews: 4200, ai: 480 },
  { name: 'Meera Beauty Salons', mrr: '₹2,495', businesses: 5, reviews: 3840, ai: 0 },
  { name: 'Ananya Fashion Hub', mrr: '₹0', businesses: 6, reviews: 1200, ai: 340 },
  { name: 'Om Electronics', mrr: '₹0', businesses: 2, reviews: 340, ai: 0 },
];

const FEATURE_ADOPTION = [
  { feature: 'Review Auto-Reply', tenants: 2341, pct: 82, color: '#22c55e' },
  { feature: 'WhatsApp Campaigns', tenants: 1647, pct: 58, color: '#25d366' },
  { feature: 'AI Summary', tenants: 1284, pct: 45, color: '#8b5cf6' },
  { feature: 'WA Triggers', tenants: 1120, pct: 39, color: '#3b82f6' },
  { feature: 'GBP Sync', tenants: 2634, pct: 93, color: '#f97316' },
  { feature: 'SMS Notifications', tenants: 892, pct: 31, color: '#eab308' },
  { feature: 'Multi-language AI', tenants: 512, pct: 18, color: '#ec4899' },
  { feature: 'Webhooks', tenants: 234, pct: 8, color: '#64748b' },
];

type Range = 'Today' | '7D' | '30D' | '90D';

const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('7D');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Date Range */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['Today', '7D', '30D', '90D'] as Range[]).map(r => (
          <button key={r} onClick={() => setRange(r)} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid', borderColor: range === r ? '#f97316' : '#1e293b', background: range === r ? 'rgba(249,115,22,0.15)' : 'transparent', color: range === r ? '#f97316' : '#94a3b8', fontSize: 13, fontWeight: range === r ? 700 : 400, cursor: 'pointer' }}>
            {r}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 7, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>📥 Export</button>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Tenant Growth */}
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Tenant Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DAILY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Line type="monotone" dataKey="tenants" stroke="#f97316" strokeWidth={2} dot={false} name="Tenants" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Daily Revenue (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(v: number) => [`₹${(v / 100).toFixed(0)}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reviews Replied */}
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Reviews Processed</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="reviews" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reviews" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly MRR */}
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>MRR Growth (6mo)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip contentStyle={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`, 'MRR']} />
              <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2} fill="url(#mrrGrad)" name="MRR" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Tenants */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Top 10 Tenants by MRR</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['#', 'Tenant', 'MRR', 'Businesses', 'Reviews Processed', 'AI Tokens Used'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_TENANTS.map((t, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>#{i + 1}</td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f1f5f9' }}>{t.name}</td>
                <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: 700 }}>{t.mrr}</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{t.businesses}</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{t.reviews.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: t.ai > 0 ? '#8b5cf6' : '#475569' }}>{t.ai > 0 ? `${t.ai.toLocaleString()}K` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature Adoption */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Feature Adoption</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURE_ADOPTION.map(f => (
            <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#94a3b8', width: 180, flexShrink: 0 }}>{f.feature}</span>
              <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, color: f.color, fontWeight: 700, width: 36, textAlign: 'right' }}>{f.pct}%</span>
              <span style={{ fontSize: 11, color: '#64748b', width: 70, textAlign: 'right' }}>{f.tenants.toLocaleString()} tenants</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
