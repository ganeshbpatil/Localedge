'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: process.env['NEXT_PUBLIC_API_URL'] + '/api/v1' });

const WHATSAPP_PROVIDERS = ['META_CLOUD', 'GUPSHUP', 'TWILIO', 'INTERAKT', 'AISENSY', 'DIALOG360'];
const AI_PROVIDERS = ['OPENAI', 'ANTHROPIC', 'GEMINI', 'GROQ', 'DEEPSEEK', 'MISTRAL', 'OLLAMA'];
const PAYMENT_PROVIDERS = ['RAZORPAY', 'CASHFREE', 'PHONEPE', 'STRIPE'];

export default function ProvidersPage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'ai' | 'payment'>('ai');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const providerSets = {
    whatsapp: WHATSAPP_PROVIDERS,
    ai: AI_PROVIDERS,
    payment: PAYMENT_PROVIDERS,
  };

  const handleSaveProvider = async () => {
    setSaving(true);
    try {
      if (activeTab === 'ai') {
        await api.post('/admin/provider-config/ai', { provider: selectedProvider, apiKey });
      } else if (activeTab === 'whatsapp') {
        await api.post('/admin/provider-config/whatsapp', { provider: selectedProvider, config: { accessToken: apiKey }, phoneNumber: '' });
      } else {
        await api.post('/admin/provider-config/payment', { provider: selectedProvider, config: { keyId: apiKey }, isDefault: true });
      }
      alert('Provider saved successfully!');
    } catch {
      alert('Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure AI, WhatsApp, and payment providers for tenants. All API keys are encrypted at rest.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['ai', 'whatsapp', 'payment'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'ai' ? 'AI / LLM' : tab === 'whatsapp' ? 'WhatsApp' : 'Payment'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider selector */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Available Providers
          </h2>
          {providerSets[activeTab].map((provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${selectedProvider === provider ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50'}`}
            >
              {provider.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Config form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          {selectedProvider ? (
            <div className="space-y-4">
              <h2 className="font-semibold">Configure {selectedProvider.replace(/_/g, ' ')}</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {activeTab === 'ai' ? 'API Key' : activeTab === 'whatsapp' ? 'Access Token' : 'Key ID'}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key (will be encrypted)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keys are encrypted with AES-256-GCM before storage
                </p>
              </div>

              <button
                onClick={handleSaveProvider}
                disabled={!apiKey || saving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Provider Config'}
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Select a provider to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Architecture note */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">Plugin Architecture</h3>
        <p className="text-xs text-muted-foreground">
          LocalEdge uses a provider factory pattern. Switching providers requires zero code changes —
          just update the active provider config here. The system reads configs from the database at runtime
          and routes requests to the correct implementation automatically.
        </p>
      </div>
    </div>
  );
}
