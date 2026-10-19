import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local
const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[admin-reset] ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

function prompt(question, isSecret = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (isSecret) {
      process.stdout.write(question);
      let input = '';
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.on('data', function onData(char) {
        char = char + '';
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.setRawMode?.(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onData);
            process.stdout.write('\n');
            rl.close();
            resolve(input);
            break;
          case '\u0003':
            process.exit();
            break;
          default:
            input += char;
            break;
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  console.log('=== Nature House Admin Password Reset (Local CLI) ===\n');

  const email = (await prompt('Admin Email to Reset: ')).toLowerCase().trim();
  if (!email || !email.includes('@')) {
    console.error('Invalid email address.');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  try {
    await client.connect();

    const { rows } = await client.query(
      'SELECT id, name, email FROM public.admin_accounts WHERE LOWER(email) = $1',
      [email]
    );

    if (rows.length === 0) {
      console.error(`No administrator account found for: ${email}`);
      process.exit(1);
    }

    const admin = rows[0];
    console.log(`Resetting password for: ${admin.name} (${admin.email})`);

    const newPassword = await prompt('New Password (min 8 chars): ', true);
    if (!newPassword || newPassword.length < 8) {
      console.error('Password must be at least 8 characters.');
      process.exit(1);
    }

    const confirmPassword = await prompt('Confirm New Password: ', true);
    if (newPassword !== confirmPassword) {
      console.error('Passwords do not match.');
      process.exit(1);
    }

    const newHash = await hashPassword(newPassword);

    await client.query(
      `
      UPDATE public.admin_accounts
      SET password_hash = $1, token_version = token_version + 1, updated_at = NOW()
      WHERE id = $2
    `,
      [newHash, admin.id]
    );

    console.log(`\nSuccessfully reset password for ${admin.email}. All previous active sessions have been invalidated.`);
  } catch (err) {
    console.error('Failed to reset password:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
