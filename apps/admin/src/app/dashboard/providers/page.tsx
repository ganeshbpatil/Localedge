'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface Provider {
  emoji: string;
  name: string;
  status: BadgeVariant;
  statusLabel: string;
  tenants: number;
}

const SECTIONS: { title: string; icon: string; providers: Provider[] }[] = [
  {
    title: 'WhatsApp Providers', icon: '💬',
    providers: [
      { emoji: '📱', name: 'Meta Cloud API', status: 'green', statusLabel: 'Active', tenants: 1842 },
      { emoji: '🔵', name: 'Gupshup', status: 'green', statusLabel: 'Active', tenants: 423 },
      { emoji: '📞', name: 'Twilio', status: 'blue', statusLabel: 'Configured', tenants: 218 },
      { emoji: '🟣', name: 'Interakt', status: 'blue', statusLabel: 'Configured', tenants: 134 },
      { emoji: '🤝', name: 'AiSensy', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
      { emoji: '🔗', name: 'Dialog360', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
    ],
  },
  {
    title: 'AI / LLM Providers', icon: '🤖',
    providers: [
      { emoji: '🟢', name: 'OpenAI (GPT-4o)', status: 'green', statusLabel: 'Active', tenants: 2134 },
      { emoji: '🟠', name: 'Anthropic (Claude 3)', status: 'green', statusLabel: 'Active', tenants: 892 },
      { emoji: '🔷', name: 'Google Gemini', status: 'green', statusLabel: 'Active', tenants: 1647 },
      { emoji: '⚡', name: 'Groq (LLaMA)', status: 'blue', statusLabel: 'Configured', tenants: 340 },
      { emoji: '🐬', name: 'DeepSeek', status: 'blue', statusLabel: 'Configured', tenants: 89 },
      { emoji: '🌐', name: 'Mistral AI', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
      { emoji: '🦙', name: 'Ollama (Local)', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
    ],
  },
  {
    title: 'Payment Providers', icon: '💳',
    providers: [
      { emoji: '💰', name: 'Razorpay', status: 'green', statusLabel: 'Active', tenants: 2634 },
      { emoji: '💵', name: 'Cashfree', status: 'blue', statusLabel: 'Configured', tenants: 213 },
      { emoji: '📲', name: 'PhonePe Business', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
      { emoji: '🌍', name: 'Stripe', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
    ],
  },
  {
    title: 'SMS Providers', icon: '📤',
    providers: [
      { emoji: '📡', name: 'MSG91', status: 'green', statusLabel: 'Active', tenants: 1240 },
      { emoji: '📨', name: 'Fast2SMS', status: 'blue', statusLabel: 'Configured', tenants: 180 },
      { emoji: '📩', name: 'Textlocal', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
    ],
  },
  {
    title: 'Email Providers', icon: '📧',
    providers: [
      { emoji: '✉️', name: 'SendGrid', status: 'green', statusLabel: 'Active', tenants: 2847 },
      { emoji: '📮', name: 'Mailgun', status: 'blue', statusLabel: 'Configured', tenants: 120 },
      { emoji: '📬', name: 'Amazon SES', status: 'gray', statusLabel: 'Inactive', tenants: 0 },
    ],
  },
];

export default function ProvidersPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['WhatsApp Providers', 'AI / LLM Providers']));

  const toggle = (title: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Info Banner */}
      <div style={{ background: '#1a0d00', border: '1px solid #7c2d12', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18 }}>🔌</span>
        <div>
          <div style={{ fontWeight: 700, color: '#fb923c', fontSize: 13, marginBottom: 3 }}>Plugin Architecture — Provider Factory</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            LocalEdge uses a dynamic provider factory pattern. Switching providers requires zero code changes — just update the active config here. The system reads configs from the database at runtime and routes all requests to the correct implementation automatically. All API keys are encrypted with AES-256-GCM before storage.
          </div>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ title, icon, providers }) => (
        <div key={title} style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <button
            onClick={() => toggle(title)}
            style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{title}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{providers.length} providers</span>
            <span style={{ color: '#475569', fontSize: 14 }}>{expanded.has(title) ? '▲' : '▼'}</span>
          </button>
          {expanded.has(title) && (
            <div style={{ borderTop: '1px solid #1e293b' }}>
              {providers.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: i > 0 ? '1px solid #1e293b' : undefined }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: 13, color: '#f1f5f9' }}>{p.name}</span>
                  <Badge variant={p.status}>{p.statusLabel}</Badge>
                  <span style={{ fontSize: 12, color: '#64748b', width: 100, textAlign: 'right' }}>
                    {p.tenants > 0 ? `${p.tenants.toLocaleString()} tenants` : '—'}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 6, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Configure</button>
                    {p.status === 'green' && (
                      <button style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #ef4444', borderRadius: 6, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Disable</button>
                    )}
                    {p.status !== 'green' && (
                      <button style={{ padding: '5px 12px', background: 'rgba(249,115,22,0.15)', border: '1px solid #f97316', borderRadius: 6, color: '#f97316', fontSize: 12, cursor: 'pointer' }}>Enable</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
