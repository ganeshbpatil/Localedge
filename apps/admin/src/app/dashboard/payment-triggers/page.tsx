'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BusinessConfig {
  id: string;
  name: string;
  city: string;
  provider: 'RAZORPAY' | 'CASHFREE' | null;
  webhookConfigured: boolean;
  triggerEnabled: boolean;
  delayMinutes: number;
  cooldownHours: number;
  reviewLink: string;
  templateName: string;
  triggerCount: number;    // total triggers sent (30 days)
  reviewsGenerated: number; // reviews received from triggers
  conversionRate: number;   // %
}

interface TriggerLog {
  id: string;
  business: string;
  phone: string;
  amount: string;
  provider: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  sentAt: string;
  waMessageId?: string;
  error?: string;
}

// ─── Mock data (replace with API calls) ──────────────────────────────────────

const BUSINESSES: BusinessConfig[] = [
  {
    id: 'biz_001', name: 'Chai Point — Koramangala', city: 'Bengaluru',
    provider: 'RAZORPAY', webhookConfigured: true, triggerEnabled: true,
    delayMinutes: 5, cooldownHours: 24, reviewLink: 'https://g.page/r/CbXxxx/review',
    templateName: 'review_request_v1', triggerCount: 847, reviewsGenerated: 203, conversionRate: 23.97,
  },
  {
    id: 'biz_002', name: 'Sharma Medicals', city: 'Mumbai',
    provider: 'RAZORPAY', webhookConfigured: true, triggerEnabled: true,
    delayMinutes: 10, cooldownHours: 48, reviewLink: 'https://g.page/r/CbYyyy/review',
    templateName: 'review_request_v1', triggerCount: 312, reviewsGenerated: 61, conversionRate: 19.55,
  },
  {
    id: 'biz_003', name: 'FreshMart Grocery', city: 'Pune',
    provider: 'CASHFREE', webhookConfigured: true, triggerEnabled: false,
    delayMinutes: 15, cooldownHours: 72, reviewLink: '',
    templateName: 'review_request_v1', triggerCount: 0, reviewsGenerated: 0, conversionRate: 0,
  },
  {
    id: 'biz_004', name: 'AutoFix Garage', city: 'Delhi',
    provider: null, webhookConfigured: false, triggerEnabled: false,
    delayMinutes: 5, cooldownHours: 24, reviewLink: '',
    templateName: 'review_request_v1', triggerCount: 0, reviewsGenerated: 0, conversionRate: 0,
  },
];

const TRIGGER_LOGS: TriggerLog[] = [
  { id: '1', business: 'Chai Point — Koramangala', phone: '+91 98765 43210', amount: '₹240', provider: 'RAZORPAY', status: 'SENT', sentAt: '2 min ago', waMessageId: 'wamid.Xxx1' },
  { id: '2', business: 'Sharma Medicals', phone: '+91 87654 32109', amount: '₹380', provider: 'RAZORPAY', status: 'SENT', sentAt: '18 min ago', waMessageId: 'wamid.Xxx2' },
  { id: '3', business: 'Chai Point — Koramangala', phone: '+91 76543 21098', amount: '₹120', provider: 'RAZORPAY', status: 'PENDING', sentAt: 'In 3 min' },
  { id: '4', business: 'FreshMart Grocery', phone: '+91 65432 10987', amount: '₹560', provider: 'CASHFREE', status: 'FAILED', sentAt: '1 hr ago', error: 'No active WhatsApp config' },
  { id: '5', business: 'Chai Point — Koramangala', phone: '+91 54321 09876', amount: '₹95', provider: 'RAZORPAY', status: 'SENT', sentAt: '2 hr ago', waMessageId: 'wamid.Xxx3' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = '#f97316' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ConfigDrawer({ biz, onClose }: { biz: BusinessConfig; onClose: () => void }) {
  const [form, setForm] = useState({ ...biz });
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  const [testPhone, setTestPhone] = useState('');

  const handleSave = () => {
    // TODO: POST /api/v1/admin/payment-configs/{biz.id}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    if (!testPhone) return;
    setTesting(true);
    setTestResult(null);
    // TODO: POST /api/v1/admin/payment-triggers/test
    setTimeout(() => {
      setTesting(false);
      setTestResult('success');
    }, 1500);
  };

  const webhookUrl = `https://api.localedge.in/api/v1/webhooks/${(form.provider ?? 'razorpay').toLowerCase()}/${biz.id}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: 520, background: '#07090f', borderLeft: '1px solid #1e293b', height: '100vh', overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Payment Trigger Config</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{biz.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Enable Toggle */}
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>Payment Trigger Active</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Automatically send WhatsApp review request after every payment</div>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, triggerEnabled: !f.triggerEnabled }))}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: form.triggerEnabled ? '#f97316' : '#1e293b',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: form.triggerEnabled ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {/* Payment Provider Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Payment Provider</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['RAZORPAY', 'CASHFREE'] as const).map(p => (
              <button
                key={p}
                onClick={() => setForm(f => ({ ...f, provider: p }))}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid',
                  borderColor: form.provider === p ? '#f97316' : '#1e293b',
                  background: form.provider === p ? 'rgba(249,115,22,0.1)' : '#0f1521',
                  color: form.provider === p ? '#f97316' : '#64748b',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Webhook Secret */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
            Webhook Secret <span style={{ color: '#475569', fontWeight: 400 }}>(from {form.provider ?? 'provider'} dashboard)</span>
          </label>
          <input
            type="password"
            placeholder={biz.webhookConfigured ? '••••••••••••••••••••••••' : 'Paste webhook secret here'}
            value={webhookSecret}
            onChange={e => setWebhookSecret(e.target.value)}
            style={{ padding: '10px 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
          />
          {biz.webhookConfigured && (
            <div style={{ fontSize: 11, color: '#16a34a', display: 'flex', gap: 4, alignItems: 'center' }}>
              <span>✓</span> Secret configured and encrypted (AES-256-GCM)
            </div>
          )}
        </div>

        {/* Webhook URL (read-only) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
            Webhook URL <span style={{ color: '#475569', fontWeight: 400 }}>(paste this into {form.provider ?? 'provider'} dashboard)</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '10px 14px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {webhookUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(webhookUrl)}
              style={{ padding: '0 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 8, color: '#64748b', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Timing Settings */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Send Delay</label>
            <select
              value={form.delayMinutes}
              onChange={e => setForm(f => ({ ...f, delayMinutes: Number(e.target.value) }))}
              style={{ padding: '10px 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
            >
              <option value={0}>Immediately</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
            <div style={{ fontSize: 11, color: '#475569' }}>Time after payment before WA is sent</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Cooldown Window</label>
            <select
              value={form.cooldownHours}
              onChange={e => setForm(f => ({ ...f, cooldownHours: Number(e.target.value) }))}
              style={{ padding: '10px 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
            >
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours (3 days)</option>
              <option value={168}>1 week</option>
              <option value={720}>1 month</option>
            </select>
            <div style={{ fontSize: 11, color: '#475569' }}>Min gap between sends to same customer</div>
          </div>
        </div>

        {/* Google Review Link */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Google Review Link</label>
          <input
            type="url"
            placeholder="https://g.page/r/XXXXX/review"
            value={form.reviewLink}
            onChange={e => setForm(f => ({ ...f, reviewLink: e.target.value }))}
            style={{ padding: '10px 14px', background: '#0f1521', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
          />
          <div style={{ fontSize: 11, color: '#475569' }}>Get this from Google Business Profile → Get more reviews → Share link</div>
        </div>

        {/* WhatsApp Template */}
        <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>WhatsApp Template Preview</div>
          <div style={{ background: '#1a2433', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Template: <span style={{ color: '#f97316' }}>review_request_v1</span> · Category: UTILITY</div>
            <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7 }}>
              Thank you for visiting <strong style={{ color: '#f97316' }}>{biz.name}</strong>. Share your experience in 30 seconds:{' '}
              <strong style={{ color: '#60a5fa' }}>{form.reviewLink || 'https://g.page/r/[your-link]/review'}</strong>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
            UTILITY category — no opt-in required, higher deliverability, lower cost vs MARKETING
          </div>
        </div>

        {/* Live Test Tool */}
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>Live Test — Send Review Request</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={handleTest}
              disabled={testing || !testPhone}
              style={{ padding: '10px 20px', background: testing ? '#1e293b' : 'rgba(249,115,22,0.15)', border: '1px solid', borderColor: testing ? '#1e293b' : '#f97316', borderRadius: 8, color: testing ? '#475569' : '#f97316', fontWeight: 600, fontSize: 13, cursor: testing ? 'default' : 'pointer' }}
            >
              {testing ? 'Sending…' : 'Send Test'}
            </button>
          </div>
          {testResult === 'success' && (
            <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid #16a34a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#4ade80' }}>
              ✓ WhatsApp message sent successfully! Check {testPhone} for the review request.
            </div>
          )}
          {testResult === 'fail' && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171' }}>
              ✗ Send failed. Check that WhatsApp config is active for this business.
            </div>
          )}
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            style={{ flex: 1, padding: '12px 0', background: saved ? 'rgba(22,163,74,0.15)' : 'rgba(249,115,22,0.15)', border: '1px solid', borderColor: saved ? '#16a34a' : '#f97316', borderRadius: 8, color: saved ? '#4ade80' : '#f97316', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            {saved ? '✓ Saved' : 'Save Configuration'}
          </button>
          <button onClick={onClose} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 8, color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentTriggersPage() {
  const [selected, setSelected] = useState<BusinessConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'businesses' | 'logs'>('businesses');

  const totalTriggers = BUSINESSES.reduce((s, b) => s + b.triggerCount, 0);
  const totalReviews = BUSINESSES.reduce((s, b) => s + b.reviewsGenerated, 0);
  const activeCount = BUSINESSES.filter(b => b.triggerEnabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Payment Trigger Engine</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>UPI/card payment → WhatsApp review request → Google ranking flywheel</p>
      </div>

      {/* Flywheel Banner */}
      <div style={{ background: '#0a0f1a', border: '1px solid #1e3a1e', borderRadius: 12, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['💳', 'Customer Pays'],
            ['→', ''],
            ['📡', 'Webhook Received'],
            ['→', ''],
            ['⏱', 'Delay (5 min)'],
            ['→', ''],
            ['💬', 'WhatsApp Sent'],
            ['→', ''],
            ['⭐', 'Review Posted'],
            ['→', ''],
            ['📈', 'GBP Rank Rises'],
            ['→', ''],
            ['🔄', 'New Customers'],
          ].map(([icon, label], i) =>
            icon === '→' ? (
              <span key={i} style={{ color: '#334155', fontSize: 16 }}>→</span>
            ) : (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{icon}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Triggers Sent (30d)" value={totalTriggers.toLocaleString()} sub="across all businesses" color="#f97316" />
        <StatCard label="Reviews Generated" value={totalReviews.toLocaleString()} sub="from payment triggers" color="#4ade80" />
        <StatCard label="Avg Conversion" value="22.4%" sub="payment → review" color="#60a5fa" />
        <StatCard label="Active Businesses" value={String(activeCount)} sub={`of ${BUSINESSES.length} configured`} color="#a78bfa" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1e293b', paddingBottom: 0 }}>
        {(['businesses', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 20px', background: 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid #f97316' : '2px solid transparent', color: activeTab === tab ? '#f97316' : '#64748b', fontWeight: activeTab === tab ? 700 : 400, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {tab === 'businesses' ? 'Business Configs' : 'Trigger Logs'}
          </button>
        ))}
      </div>

      {/* Business Configs Tab */}
      {activeTab === 'businesses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px 80px 100px', gap: 12, padding: '10px 20px', background: '#0a0f1a', borderBottom: '1px solid #1e293b' }}>
            {['Business', 'Provider', 'Delay / Cooldown', 'Triggers', 'Reviews', 'Rate', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>

          {BUSINESSES.map((biz, i) => (
            <div
              key={biz.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px 80px 100px', gap: 12, padding: '14px 20px', borderTop: i > 0 ? '1px solid #1e293b' : undefined, alignItems: 'center' }}
            >
              {/* Business */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{biz.name}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{biz.city}</div>
              </div>

              {/* Provider + Status */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {biz.provider ? (
                  <>
                    <Badge variant={biz.webhookConfigured ? 'green' : 'yellow'}>
                      {biz.provider}
                    </Badge>
                    {!biz.webhookConfigured && <span style={{ fontSize: 10, color: '#fbbf24' }}>No webhook</span>}
                  </>
                ) : (
                  <Badge variant="gray">Not set</Badge>
                )}
              </div>

              {/* Timing */}
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {biz.delayMinutes === 0 ? 'Instant' : `${biz.delayMinutes}m`} / {biz.cooldownHours}h
              </div>

              {/* Stats */}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{biz.triggerCount.toLocaleString()}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>{biz.reviewsGenerated}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: biz.conversionRate > 0 ? '#60a5fa' : '#334155' }}>
                {biz.conversionRate > 0 ? `${biz.conversionRate.toFixed(1)}%` : '—'}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => setSelected(biz)}
                  style={{ padding: '5px 12px', background: 'rgba(249,115,22,0.1)', border: '1px solid #f97316', borderRadius: 6, color: '#f97316', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                >
                  Configure
                </button>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: biz.triggerEnabled ? '#22c55e' : '#334155',
                }} title={biz.triggerEnabled ? 'Active' : 'Disabled'} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trigger Logs Tab */}
      {activeTab === 'logs' && (
        <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 1fr 100px 1.5fr', gap: 12, padding: '10px 20px', background: '#0a0f1a', borderBottom: '1px solid #1e293b' }}>
            {['Business', 'Customer', 'Amount', 'Provider', 'Status', 'Sent At / Error'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>

          {TRIGGER_LOGS.map((log, i) => (
            <div
              key={log.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 1fr 100px 1.5fr', gap: 12, padding: '12px 20px', borderTop: i > 0 ? '1px solid #1e293b' : undefined, alignItems: 'center' }}
            >
              <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 500 }}>{log.business}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{log.phone}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{log.amount}</div>
              <div style={{ fontSize: 11 }}><Badge variant="blue">{log.provider}</Badge></div>
              <div>
                <Badge variant={log.status === 'SENT' ? 'green' : log.status === 'PENDING' ? 'yellow' : 'red'}>
                  {log.status}
                </Badge>
              </div>
              <div style={{ fontSize: 11, color: log.error ? '#f87171' : '#64748b' }}>
                {log.error ?? log.sentAt}
                {log.waMessageId && <div style={{ color: '#334155', fontSize: 10, marginTop: 2 }}>{log.waMessageId}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Config Drawer */}
      {selected && <ConfigDrawer biz={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
