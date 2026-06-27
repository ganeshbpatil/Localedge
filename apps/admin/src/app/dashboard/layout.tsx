'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/providers', label: 'Providers', icon: '🔌' },
  { href: '/dashboard/tenants', label: 'Tenants', icon: '🏢' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, logout } = useAuthStore();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui,sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>LE</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>LocalEdge</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', color: active ? '#a5b4fc' : '#94a3b8', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', fontSize: 14, fontWeight: active ? 600 : 400 }}>
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #334155' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#6366f1', marginBottom: 10 }}>{user?.role}</div>
          <button onClick={() => { logout(); router.push('/login'); }} style={{ width: '100%', padding: '7px 0', background: '#1e293b', border: '1px solid #475569', borderRadius: 6, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
