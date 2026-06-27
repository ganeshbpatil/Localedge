'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/lib/auth';

const BASE = (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8083') + '/api/v1';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@localedge.in');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${BASE}/auth/admin-login`, { email, password });
      setAuth(data.accessToken, data.user);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 380, background: '#1e293b', borderRadius: 16, padding: 36, border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22, fontWeight: 700, color: '#fff' }}>LE</div>
          <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>LocalEdge Admin</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Super Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20, marginBottom: 0 }}>
          LocalEdge v1.0 · Super Admin Access Only
        </p>
      </div>
    </div>
  );
}
