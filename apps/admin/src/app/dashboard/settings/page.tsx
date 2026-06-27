'use client';
import { useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';

interface MasterSwitch {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const MASTER_SWITCHES: MasterSwitch[] = [
  { key: 'platform_maintenance', label: 'Maintenance Mode', description: 'Put the entire platform in maintenance. All tenant access disabled.', defaultOn: false },
  { key: 'new_signups', label: 'New Signups', description: 'Allow new tenant self-service registrations.', defaultOn: true },
  { key: 'ai_system', label: 'AI System', description: 'Enable AI review reply and all LLM-powered features globally.', defaultOn: true },
  { key: 'whatsapp_system', label: 'WhatsApp System', description: 'Enable global WhatsApp messaging (campaigns + triggers).', defaultOn: true },
  { key: 'payment_processing', label: 'Payment Processing', description: 'Enable subscription billing and Razorpay integration.', defaultOn: true },
  { key: 'email_system', label: 'Email System', description: 'Enable transactional and campaign email via SendGrid.', defaultOn: true },
  { key: 'debug_logging', label: 'Debug Logging', description: 'Verbose logging in API. Disable in production for performance.', defaultOn: false },
  { key: 'rate_limiting', label: 'Rate Limiting', description: 'Apply per-tenant API rate limits. Disable only for load testing.', defaultOn: true },
];

interface ConfigField {
  label: string;
  value: string;
  type?: string;
  hint?: string;
}

interface ConfigSection {
  title: string;
  icon: string;
  fields: ConfigField[];
}

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    title: 'Platform Identity', icon: '⚡',
    fields: [
      { label: 'Platform Name', value: 'LocalEdge' },
      { label: 'Support Email', value: 'support@localedge.in' },
      { label: 'Admin Contact', value: 'admin@localedge.in' },
      { label: 'Platform URL', value: 'https://app.localedge.in' },
    ],
  },
  {
    title: 'AI Configuration', icon: '🤖',
    fields: [
      { label: 'Default AI Provider', value: 'openai' },
      { label: 'Default Model', value: 'gpt-4o-mini' },
      { label: 'Max Tokens per Call', value: '2048' },
      { label: 'AI Cost Alert Threshold (₹/day)', value: '10000', hint: 'Send alert when daily AI cost exceeds this amount' },
    ],
  },
  {
    title: 'WhatsApp Defaults', icon: '💬',
    fields: [
      { label: 'Default Provider', value: 'META_CLOUD' },
      { label: 'Rate Limit (msg/min per tenant)', value: '60' },
      { label: 'Campaign Delay (ms)', value: '1000', hint: 'Delay between messages in bulk campaigns' },
      { label: 'Max Retries', value: '3' },
    ],
  },
  {
    title: 'Billing & Plans', icon: '💰',
    fields: [
      { label: 'Trial Period (days)', value: '14' },
      { label: 'Grace Period after Payment Failure (days)', value: '7' },
      { label: 'Free Plan Review Limit/mo', value: '50' },
      { label: 'Default Currency', value: 'INR' },
    ],
  },
  {
    title: 'Security', icon: '🔒',
    fields: [
      { label: 'JWT Expiry (hours)', value: '24' },
      { label: 'Max Login Attempts', value: '5' },
      { label: 'Session Lockout Duration (min)', value: '30' },
      { label: 'API Rate Limit (req/min per tenant)', value: '300' },
    ],
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Master Switches */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', background: '#07090f' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Master Switches</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Global platform controls. Changes take effect immediately.</p>
        </div>
        {MASTER_SWITCHES.map((sw, i) => (
          <div key={sw.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderTop: i > 0 ? '1px solid #1e293b' : undefined }}>
            <Toggle defaultOn={sw.defaultOn} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{sw.label}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{sw.description}</div>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{sw.key}</span>
          </div>
        ))}
      </div>

      {/* Config Sections */}
      {CONFIG_SECTIONS.map(section => (
        <div key={section.title} style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', background: '#07090f', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{section.icon}</span>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{section.title}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 20 }}>
            {section.fields.map(field => (
              <div key={field.label}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  defaultValue={field.value}
                  style={{ width: '100%' }}
                />
                {field.hint && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{field.hint}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          style={{ padding: '10px 28px', background: saved ? '#22c55e' : '#f97316', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
        >
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
