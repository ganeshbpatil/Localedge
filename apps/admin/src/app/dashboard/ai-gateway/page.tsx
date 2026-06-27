'use client';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';

interface RoutingRule {
  useCase: string;
  primary: string;
  fallback: string;
  maxCost: string;
  callsToday: number;
  successPct: number;
  latencyMs: number;
}

const ROUTING: RoutingRule[] = [
  { useCase: 'Review Reply', primary: 'GPT-4o-mini', fallback: 'Gemini Flash', maxCost: '₹0.05', callsToday: 8420, successPct: 99.2, latencyMs: 890 },
  { useCase: 'Review Summary', primary: 'Claude 3 Haiku', fallback: 'GPT-4o-mini', maxCost: '₹0.10', callsToday: 1284, successPct: 98.7, latencyMs: 1240 },
  { useCase: 'WA Campaign Gen', primary: 'GPT-4o', fallback: 'Claude 3 Sonnet', maxCost: '₹0.50', callsToday: 892, successPct: 97.4, latencyMs: 2100 },
  { useCase: 'Business Description', primary: 'Gemini Pro', fallback: 'GPT-4o-mini', maxCost: '₹0.20', callsToday: 340, successPct: 99.8, latencyMs: 1560 },
  { useCase: 'Sentiment Analysis', primary: 'Groq LLaMA', fallback: 'Gemini Flash', maxCost: '₹0.02', callsToday: 12847, successPct: 99.9, latencyMs: 120 },
  { useCase: 'Customer Intent', primary: 'GPT-4o-mini', fallback: 'Groq LLaMA', maxCost: '₹0.05', callsToday: 4821, successPct: 98.1, latencyMs: 450 },
];

const PROVIDER_COSTS = [
  { provider: 'OpenAI', model: 'GPT-4o / GPT-4o-mini', calls: 1284, tokens: '2.1M', cost: '₹3,240', color: '#22c55e' },
  { provider: 'Anthropic', model: 'Claude 3 Haiku / Sonnet', calls: 892, tokens: '842K', cost: '₹2,180', color: '#f97316' },
  { provider: 'Google', model: 'Gemini Pro / Flash', calls: 1647, tokens: '4.2M', cost: '₹890', color: '#3b82f6' },
  { provider: 'Groq', model: 'LLaMA 3.1 70B', calls: 340, tokens: '380K', cost: '₹120', color: '#8b5cf6' },
];

export default function AIGatewayPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total API Calls Today" value="28,684" sub="+18% vs yesterday" color="#f97316" icon="🤖" />
        <StatCard label="Total Tokens Used" value="7.5M" sub="Across all models" color="#8b5cf6" icon="🔢" />
        <StatCard label="Total Cost Today" value="₹6,430" sub="Avg ₹0.22/call" color="#22c55e" icon="💰" />
        <StatCard label="Avg Success Rate" value="99.1%" sub="Last 24 hours" color="#3b82f6" icon="✅" />
      </div>

      {/* Cost by Provider */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 14px' }}>Cost by Provider — Today</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {PROVIDER_COSTS.map(p => (
            <div key={p.provider} style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 4 }}>{p.provider}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>{p.model}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{p.cost}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                <span>{p.calls.toLocaleString()} calls</span>
                <span>{p.tokens} tokens</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Rules */}
      <div style={{ background: '#0f1521', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Routing Rules</h2>
          <button style={{ padding: '7px 14px', background: '#f97316', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Rule</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#07090f' }}>
            <tr style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Use Case', 'Primary Model', 'Fallback', 'Max Cost', 'Calls Today', 'Success %', 'Avg Latency', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROUTING.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f1f5f9' }}>{r.useCase}</td>
                <td style={{ padding: '12px 14px' }}><Badge variant="orange">{r.primary}</Badge></td>
                <td style={{ padding: '12px 14px' }}><Badge variant="gray">{r.fallback}</Badge></td>
                <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: 600 }}>{r.maxCost}</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{r.callsToday.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: r.successPct >= 99 ? '#22c55e' : '#eab308', fontWeight: 600 }}>{r.successPct}%</td>
                <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{r.latencyMs}ms</td>
                <td style={{ padding: '12px 14px' }}>
                  <button style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 5, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
