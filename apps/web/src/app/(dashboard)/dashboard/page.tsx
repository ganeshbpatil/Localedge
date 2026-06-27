'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, Users, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

function MetricCard({ title, value, change, icon: Icon, color = 'text-primary' }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-500' : 'text-destructive'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // In production, get the active business from context/state
  const businessId = 'demo-business-id';

  const { data: stats } = useQuery({
    queryKey: ['dashboard', businessId],
    queryFn: () => analyticsApi.dashboard(businessId).then((r) => r.data.data),
    enabled: !!businessId,
    placeholderData: {
      period: '30d',
      reviews: { total: 0, averageRating: 0 },
      newCustomers: 0,
      payments: { count: 0, revenue: 0 },
      whatsappMessagesSent: 0,
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Last 30 days overview</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Rating"
          value={stats?.reviews.averageRating.toFixed(1) ?? '0.0'}
          icon={Star}
          change={5}
        />
        <MetricCard
          title="New Customers"
          value={stats?.newCustomers ?? 0}
          icon={Users}
          change={12}
        />
        <MetricCard
          title="WhatsApp Sent"
          value={(stats?.whatsappMessagesSent ?? 0).toLocaleString('en-IN')}
          icon={MessageSquare}
          change={23}
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(stats?.payments.revenue ?? 0)}
          icon={TrendingUp}
          change={8}
        />
      </div>

      {/* Reviews overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Reviews Overview</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-muted-foreground">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: rating === 5 ? '60%' : rating === 4 ? '25%' : rating === 3 ? '10%' : '5%' }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : 5}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Reply to Reviews', href: '/dashboard/reviews', color: 'bg-yellow-500/10 text-yellow-500' },
              { label: 'Send WhatsApp', href: '/dashboard/whatsapp', color: 'bg-green-500/10 text-green-500' },
              { label: 'Add Customer', href: '/dashboard/customers', color: 'bg-blue-500/10 text-blue-500' },
              { label: 'Create Offer', href: '/dashboard/offers', color: 'bg-purple-500/10 text-purple-500' },
              { label: 'Generate QR', href: '/dashboard/qr', color: 'bg-orange-500/10 text-orange-500' },
              { label: 'View Analytics', href: '/dashboard/analytics', color: 'bg-pink-500/10 text-pink-500' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`p-3 rounded-lg text-sm font-medium text-center transition-colors hover:opacity-80 ${action.color}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
