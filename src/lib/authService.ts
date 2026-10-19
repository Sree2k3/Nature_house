import crypto from 'crypto';
import { query } from './db';
import { UnauthorizedError, ValidationError } from './errors';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  isActive: boolean;
  tokenVersion: number;
}

// Bounded local rate limiting (per IP/email)
interface ThrottleEntry {
  attempts: number;
  lockedUntil: number;
}
const localThrottle = new Map<string, ThrottleEntry>();

export function checkThrottle(key: string): void {
  const entry = localThrottle.get(key);
  if (entry) {
    if (Date.now() < entry.lockedUntil) {
      const waitMins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
      throw new UnauthorizedError(`Too many failed login attempts. Please wait ${waitMins} minute(s) before trying again.`);
    }
    // Expired lock
    if (Date.now() >= entry.lockedUntil && entry.attempts >= 5) {
      localThrottle.delete(key);
    }
  }
}

export function recordFailedAttempt(key: string): void {
  const entry = localThrottle.get(key) || { attempts: 0, lockedUntil: 0 };
  entry.attempts += 1;
  if (entry.attempts >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
  }
  localThrottle.set(key, entry);
}

export function clearThrottle(key: string): void {
  localThrottle.delete(key);
}

/**
 * Modern salted scrypt password hashing using Node.js crypto.
 */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!password || password.length < 8) {
      return reject(new ValidationError('Password must be at least 8 characters.'));
    }
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Constant-time password verification supporting scrypt and legacy PBKDF2.
 */
export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!password || !storedHash) return resolve(false);

    // scrypt format
    if (storedHash.startsWith('scrypt$')) {
      const parts = storedHash.split('$');
      const salt = parts[1];
      const hash = parts[2];
      if (!salt || !hash) return resolve(false);

      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false);
        const hashBuf = Buffer.from(hash, 'hex');
        if (hashBuf.length !== derivedKey.length) return resolve(false);
        resolve(crypto.timingSafeEqual(hashBuf, derivedKey));
      });
      return;
    }

    // legacy PBKDF2 format: salt:hash
    if (storedHash.includes(':')) {
      const [salt, hash] = storedHash.split(':');
      if (!salt || !hash) return resolve(false);

      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) return resolve(false);
        const hashBuf = Buffer.from(hash, 'hex');
        if (hashBuf.length !== derivedKey.length) return resolve(false);
        resolve(crypto.timingSafeEqual(hashBuf, derivedKey));
      });
      return;
    }

    resolve(false);
  });
}

/**
 * Look up an administrator by email from local PostgreSQL.
 */
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) return null;

  try {
    const res = await query<{
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      is_active: boolean;
      token_version: number;
    }>(
      `SELECT id, email, name, role, password_hash, is_active, token_version FROM public.admin_accounts WHERE LOWER(email) = $1 LIMIT 1`,
      [cleanEmail]
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      passwordHash: r.password_hash,
      isActive: r.is_active,
      tokenVersion: r.token_version,
    };
  } catch (err) {
    console.warn('[authService] Could not query admin_accounts table:', err);
    return null;
  }
}

/**
 * Look up an administrator by ID.
 */
export async function getAdminById(id: string): Promise<AdminUser | null> {
  if (!id) return null;

  try {
    const res = await query<{
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      is_active: boolean;
      token_version: number;
    }>(
      `SELECT id, email, name, role, password_hash, is_active, token_version FROM public.admin_accounts WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      passwordHash: r.password_hash,
      isActive: r.is_active,
      tokenVersion: r.token_version,
    };
  } catch (err) {
    console.warn('[authService] Could not query admin_accounts by ID:', err);
    return null;
  }
}

/**
 * Update an administrator password and invalidate existing sessions by incrementing token_version.
 */
export async function updateAdminPassword(email: string, newPassword: string): Promise<boolean> {
  const cleanEmail = (email || '').toLowerCase().trim();
  const newHash = await hashPassword(newPassword);

  const res = await query(
    `
    UPDATE public.admin_accounts
    SET password_hash = $1, token_version = token_version + 1, updated_at = NOW()
    WHERE LOWER(email) = $2
  `,
    [newHash, cleanEmail]
  );

  return (res.rowCount ?? 0) > 0;
}

/**
 * Create or bootstrap a new admin account in local PostgreSQL.
 */
export async function createAdminAccount(
  email: string,
  name: string,
  role = 'admin',
  plainPassword: string
): Promise<AdminUser> {
  const cleanEmail = (email || '').toLowerCase().trim();
  const passwordHash = await hashPassword(plainPassword);
  const id = crypto.randomUUID();

  await query(
    `
    INSERT INTO public.admin_accounts (id, email, name, role, password_hash, is_active, token_version)
    VALUES ($1, $2, $3, $4, $5, true, 1)
  `,
    [id, cleanEmail, name.trim(), role, passwordHash]
  );

  return {
    id,
    email: cleanEmail,
    name: name.trim(),
    role,
    passwordHash,
    isActive: true,
    tokenVersion: 1,
  };
}
