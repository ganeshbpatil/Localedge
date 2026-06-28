'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const NAV = [
  { section: 'OVERVIEW', items: [{ href: '/dashboard', label: 'Dashboard', icon: '📊' }] },
  { section: 'MANAGEMENT', items: [
    { href: '/dashboard/tenants', label: 'Tenants', icon: '🏢' },
    { href: '/dashboard/businesses', label: 'Businesses', icon: '🏪' },
    { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: '💳' },
  ]},
  { section: 'GROWTH ENGINE', items: [
    { href: '/dashboard/payment-triggers', label: 'Payment Triggers', icon: '⚡' },
  ]},
  { section: 'INTEGRATIONS', items: [
    { href: '/dashboard/providers', label: 'Provider Config', icon: '🔌' },
    { href: '/dashboard/ai-gateway', label: 'AI Gateway', icon: '🤖' },
    { href: '/dashboard/webhooks', label: 'Webhooks', icon: '🔗' },
  ]},
  { section: 'PLATFORM', items: [
    { href: '/dashboard/feature-flags', label: 'Feature Flags', icon: '🚩' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
    { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside style={{ width: 240, background: '#0a0f1a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, overflow: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9', letterSpacing: '-0.3px' }}>LocalEdge</div>
            <div style={{ fontSize: 11, color: '#f97316', fontWeight: 600, letterSpacing: '0.5px' }}>SUPER ADMIN</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.8px', padding: '0 8px', marginBottom: 4 }}>{section}</div>
            {items.map(({ href, label, icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, marginBottom: 1, textDecoration: 'none', color: active ? '#fff' : '#94a3b8', background: active ? 'rgba(249,115,22,0.15)' : 'transparent', borderLeft: active ? '2px solid #f97316' : '2px solid transparent', fontSize: 13.5, fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(user?.name ?? 'A')[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? 'Admin'}</div>
            <div style={{ fontSize: 10, color: '#f97316', fontWeight: 600 }}>{user?.role}</div>
          </div>
          <div style={{ position: 'relative', marginLeft: 'auto', cursor: 'pointer' }}>
            🔔
            <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'block' }} />
          </div>
        </div>
        <button onClick={() => { logout(); router.push('/login'); }} style={{ width: '100%', padding: '7px 0', background: 'transparent', border: '1px solid #1e293b', borderRadius: 6, color: '#64748b', fontSize: 12, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
