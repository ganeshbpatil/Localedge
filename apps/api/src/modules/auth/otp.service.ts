import { Injectable } from '@nestjs/common';
import { OTP_LENGTH, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '@localedge/shared';

// In production, use Redis-backed cache for OTP storage
// Simple in-memory implementation for now (not distributed)

const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

@Injectable()
export class OtpService {
  async generateOtp(phone: string): Promise<string> {
    // Generate a random 6-digit OTP
    const otp = Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1))
      .toString()
      .padStart(OTP_LENGTH, '0');

    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    otpStore.set(phone, { otp, expiresAt, attempts: 0 });

    return otp;
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const stored = otpStore.get(phone);
    if (!stored) return false;

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return false;
    }

    // Check attempts
    if (stored.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(phone);
      return false;
    }

    stored.attempts++;

    if (stored.otp !== otp) {
      return false;
    }

    otpStore.delete(phone);
    return true;
  }
}
