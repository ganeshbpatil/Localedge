'use client';

export default function TenantsPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>Tenants</h1>
      <p style={{ color: '#94a3b8', marginTop: 0, fontSize: 14 }}>Multi-tenant management — coming soon in v1.1</p>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 48, textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Tenant management UI is being built. Use the API directly for now.</div>
        <code style={{ display: 'block', marginTop: 16, color: '#6366f1', fontSize: 13 }}>GET /api/v1/tenant</code>
      </div>
    </div>
  );
}
