'use client';
import { useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

type Category = 'core' | 'ai' | 'whatsapp' | 'payments' | 'marketing' | 'experimental';

interface Flag {
  key: string;
  description: string;
  category: Category;
  enabled: boolean;
  plan: string;
  rollout: number;
}

const FLAGS: Flag[] = [
  { key: 'review_auto_reply', description: 'Automatically reply to Google reviews with AI', category: 'core', enabled: true, plan: 'STARTER+', rollout: 100 },
  { key: 'review_sentiment_analysis', description: 'Run sentiment analysis on incoming reviews', category: 'ai', enabled: true, plan: 'GROWTH+', rollout: 100 },
  { key: 'gbp_sync_enabled', description: 'Sync Google Business Profile data hourly', category: 'core', enabled: true, plan: 'ALL', rollout: 100 },
  { key: 'whatsapp_campaigns', description: 'Enable WhatsApp bulk campaign messaging', category: 'whatsapp', enabled: true, plan: 'GROWTH+', rollout: 100 },
  { key: 'whatsapp_triggers', description: 'Event-based WhatsApp trigger messages', category: 'whatsapp', enabled: true, plan: 'STARTER+', rollout: 100 },
  { key: 'ai_chat_assistant', description: 'Embedded AI chat assistant for businesses', category: 'ai', enabled: false, plan: 'PRO+', rollout: 0 },
  { key: 'payment_razorpay', description: 'Razorpay payment gateway integration', category: 'payments', enabled: true, plan: 'STARTER+', rollout: 100 },
  { key: 'payment_cashfree', description: 'Cashfree payment gateway integration', category: 'payments', enabled: true, plan: 'GROWTH+', rollout: 80 },
  { key: 'email_campaigns', description: 'Send bulk email campaigns to customers', category: 'marketing', enabled: false, plan: 'GROWTH+', rollout: 25 },
  { key: 'sms_notifications', description: 'SMS notification system via MSG91', category: 'marketing', enabled: true, plan: 'STARTER+', rollout: 100 },
  { key: 'analytics_dashboard', description: 'Per-tenant analytics and reports dashboard', category: 'core', enabled: true, plan: 'ALL', rollout: 100 },
  { key: 'ai_competitor_analysis', description: 'AI-powered competitor review analysis', category: 'experimental', enabled: false, plan: 'ENTERPRISE', rollout: 10 },
  { key: 'whatsapp_chatbot', description: 'Full-fledged WhatsApp chatbot builder', category: 'experimental', enabled: false, plan: 'PRO+', rollout: 5 },
  { key: 'multi_language_reviews', description: 'AI reply to reviews in 12 Indian languages', category: 'ai', enabled: true, plan: 'GROWTH+', rollout: 60 },
  { key: 'qr_code_generator', description: 'QR code generation for review requests', category: 'marketing', enabled: true, plan: 'STARTER+', rollout: 100 },
  { key: 'webhook_system', description: 'Outbound webhook system for integrations', category: 'core', enabled: true, plan: 'GROWTH+', rollout: 100 },
];

const CAT_COLORS: Record<Category, BadgeVariant> = {
  core: 'blue', ai: 'purple', whatsapp: 'green', payments: 'yellow', marketing: 'orange', experimental: 'red',
};

const CATS: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'core', label: 'Core' },
  { key: 'ai', label: 'AI' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'payments', label: 'Payments' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'experimental', label: 'Experimental' },
];

export default function FeatureFlagsPage() {
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [flags, setFlags] = useState<Flag[]>(FLAGS);

  const visible = cat === 'all' ? flags : flags.filter(f => f.category === cat);

  const toggleFlag = (key: string, val: boolean) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: val } : f));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'Total Flags', value: FLAGS.length, color: '#f97316' },
          { label: 'Enabled', value: FLAGS.filter(f => f.enabled).length, color: '#22c55e' },
          { label: 'Disabled', value: FLAGS.filter(f => !f.enabled).length, color: '#64748b' },
          { label: 'Beta (< 100%)', value: FLAGS.filter(f => f.rollout > 0 && f.rollout < 100).length, color: '#eab308' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid',
              borderColor: cat === c.key ? '#f97316' : '#1e293b',
              background: cat === c.key ? 'rgba(249,115,22,0.15)' : 'transparent',
              color: cat === c.key ? '#f97316' : '#94a3b8',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Enabled', 'Flag Key', 'Description', 'Category', 'Min Plan', 'Rollout %'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((f, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px' }}>
                  <Toggle defaultOn={f.enabled} onChange={v => toggleFlag(f.key, v)} />
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: '#f97316' }}>{f.key}</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>{f.description}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant={CAT_COLORS[f.category]}>{f.category}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12, fontWeight: 500 }}>{f.plan}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
                      <div style={{ width: `${f.rollout}%`, height: '100%', background: f.rollout === 100 ? '#22c55e' : f.rollout > 0 ? '#eab308' : '#ef4444', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', width: 30 }}>{f.rollout}%</span>
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
