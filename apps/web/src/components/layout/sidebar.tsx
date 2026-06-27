'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Star,
  MessageSquare,
  BarChart3,
  Tag,
  QrCode,
  Users,
  CreditCard,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Businesses', href: '/dashboard/businesses', icon: Building2 },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'WhatsApp', href: '/dashboard/whatsapp', icon: MessageSquare },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Offers', href: '/dashboard/offers', icon: Tag },
  { name: 'QR Codes', href: '/dashboard/qr', icon: QrCode },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Features', href: '/dashboard/ai', icon: Zap },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">LE</span>
          </div>
          <span className="font-bold text-foreground">LocalEdge</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">Business Owner</div>
            <div className="text-muted-foreground text-xs">Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
