import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getAdminByEmail, verifyPassword } from './authService';

export const ADMIN_COOKIE_NAME = 'nature_house_admin_session';
export const MAX_ADMIN_COUNT = 3;

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'botanist' | 'manager' | string;
  passwordHash?: string;
  tokenVersion?: number;
}

export interface AdminSession {
  isValid: boolean;
  email?: string;
  name?: string;
  role?: string;
  error?: string;
}

/**
 * Returns cryptographic session signing secret from environment.
 * In development, provides a dedicated local fallback if not defined in .env.local.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: SESSION_SECRET is not configured in environment.');
    }
    return 'nature_house_local_dev_secret_key_8492019384729104';
  }
  return secret;
}

/**
 * Helper to parse configurable admin emails from environment variables.
 */
export function parseConfiguredAdminEmails(): string[] {
  if (process.env.AUTHORIZED_ADMIN_EMAILS) {
    const list = process.env.AUTHORIZED_ADMIN_EMAILS.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (list.length > 0) {
      return list.slice(0, MAX_ADMIN_COUNT);
    }
  }

  const emails: string[] = [];
  if (process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL) {
    emails.push((process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL)!.toLowerCase().trim());
  }
  if (process.env.ADMIN_EMAIL_2) {
    emails.push(process.env.ADMIN_EMAIL_2.toLowerCase().trim());
  }
  if (process.env.ADMIN_EMAIL_3) {
    emails.push(process.env.ADMIN_EMAIL_3.toLowerCase().trim());
  }

  const defaults = ['admin@naturehouse.in', 'botanist@naturehouse.in', 'manager@naturehouse.in'];
  for (const def of defaults) {
    if (emails.length < MAX_ADMIN_COUNT && !emails.includes(def)) {
      emails.push(def);
    }
  }

  return emails.slice(0, MAX_ADMIN_COUNT);
}

/**
 * Checks whether an email is one of the authorized administrators.
 */
export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.toLowerCase().trim();
  const allowed = parseConfiguredAdminEmails();
  return allowed.includes(cleanEmail);
}

/**
 * Generates an HMAC-SHA256 signed, tamper-proof session token.
 */
export function generateSignedSessionToken(
  email: string,
  role = 'owner',
  name = 'Administrator',
  tokenVersion = 1
): string {
  const cleanEmail = email.toLowerCase().trim();
  const payload = {
    email: cleanEmail,
    role,
    name,
    tokenVersion,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7-day expiration
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies whether the incoming server request carries a cryptographically valid,
 * unexpired, signed session token from an authorized admin.
 * Also checks token_version against the database to guarantee session revocation on password reset.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payloadB64, providedSig] = parts;

    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadB64)
      .digest('base64url');

    const providedBuf = Buffer.from(providedSig);
    const expectedBuf = Buffer.from(expectedSig);

    if (providedBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return false;

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return false; // Expired
    }

    // Verify authorized email
    if (!isAuthorizedAdminEmail(payload.email)) {
      return false;
    }

    // Check token version against database account if available
    const dbAdmin = await getAdminByEmail(payload.email);
    if (dbAdmin) {
      if (!dbAdmin.isActive) return false;
      if (payload.tokenVersion && dbAdmin.tokenVersion !== payload.tokenVersion) {
        return false; // Stale session revoked by password reset
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies admin credentials for login (supports DB accounts with fallback to config).
 */
export async function authenticateAdmin(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; admin?: AdminAccount; error?: string }> {
  const cleanEmail = (email || '').toLowerCase().trim();

  // Check authorized list
  if (!isAuthorizedAdminEmail(cleanEmail)) {
    return { success: false, error: 'Invalid email address or unauthorized administrator.' };
  }

  // 1. Try PostgreSQL admin_accounts
  const dbAdmin = await getAdminByEmail(cleanEmail);
  if (dbAdmin && dbAdmin.passwordHash) {
    if (!dbAdmin.isActive) {
      return { success: false, error: 'This administrator account is currently inactive.' };
    }
    const isValid = await verifyPassword(plainPassword, dbAdmin.passwordHash);
    if (isValid) {
      return {
        success: true,
        admin: {
          id: dbAdmin.id,
          email: dbAdmin.email,
          name: dbAdmin.name,
          role: dbAdmin.role,
          tokenVersion: dbAdmin.tokenVersion,
        },
      };
    }
    return { success: false, error: 'Invalid administrator credentials.' };
  }

  // 2. Default local dev fallback if DB accounts haven't been seeded yet
  const configuredPassword = process.env.ADMIN_PASSWORD || 'nature2026';
  if (plainPassword === configuredPassword) {
    return {
      success: true,
      admin: {
        id: `admin-${cleanEmail}`,
        email: cleanEmail,
        name: 'Administrator',
        role: 'owner',
        tokenVersion: 1,
      },
    };
  }

  return { success: false, error: 'Invalid administrator credentials.' };
}
