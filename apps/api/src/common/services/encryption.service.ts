import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { AppConfig } from '../../config/configuration.js';

// ============================================================
// Encryption Service
// Used to encrypt/decrypt provider API keys stored in DB.
// Uses AES-256-GCM for authenticated encryption.
// ============================================================

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private readonly config: ConfigService<AppConfig>) {
    const rawKey = this.config.get<string>('encryptionKey') ?? 'change-this-32-char-encryption-key!';
    // Ensure 32 bytes
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Encrypt a string value
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: iv:tag:encrypted (all hex)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypt a string value
   */
  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, tagHex, encryptedHex] = parts as [string, string, string];
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
  }

  /**
   * Encrypt all string values in an object (for provider configs)
   */
  encryptObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > 0) {
        result[key] = this.encrypt(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Decrypt all string values in an object
   */
  decryptObject(obj: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        try {
          result[key] = this.decrypt(value);
        } catch {
          result[key] = value; // not encrypted
        }
      }
    }
    return result;
  }
}
