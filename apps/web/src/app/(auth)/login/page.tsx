'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/otp/send', { phone });
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<{
        data: { accessToken: string; refreshToken: string; user: { id: string; name: string; role: string; tenantId: string } };
      }>('/auth/otp/verify', { phone, otp });

      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(accessToken, refreshToken, user);
      router.push('/dashboard');
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl border border-border shadow-xl">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">LE</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">LocalEdge</h1>
          <p className="text-muted-foreground text-sm mt-1">India&apos;s AI Business Growth Platform</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  className="flex-1 rounded-r-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-primary-600 transition-colors"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">Enter OTP</label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-primary hover:underline"
                >
                  Change number
                </button>
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                Sent to +91 {phone}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground text-center tracking-widest text-xl placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-primary-600 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
