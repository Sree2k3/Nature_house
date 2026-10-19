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
  console.error('[admin-create] ERROR: DATABASE_URL is not set.');
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
  console.log('=== Nature House Admin Account Bootstrap / Creation ===\n');

  const email = (await prompt('Admin Email: ')).toLowerCase().trim();
  if (!email || !email.includes('@')) {
    console.error('Invalid email address.');
    process.exit(1);
  }

  const name = await prompt('Admin Full Name: ');
  if (!name) {
    console.error('Name is required.');
    process.exit(1);
  }

  const role = (await prompt('Role [admin]: ')) || 'admin';
  const password = await prompt('Password (min 8 chars): ', true);
  if (!password || password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const confirmPassword = await prompt('Confirm Password: ', true);
  if (password !== confirmPassword) {
    console.error('Passwords do not match.');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const passwordHash = await hashPassword(password);
    const id = crypto.randomUUID();

    await client.query(
      `
      INSERT INTO public.admin_accounts (id, email, name, role, password_hash, is_active, token_version)
      VALUES ($1, $2, $3, $4, $5, true, 1)
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash, token_version = public.admin_accounts.token_version + 1, updated_at = NOW()
    `,
      [id, email, name, role, passwordHash]
    );

    console.log(`\nSuccessfully provisioned administrator account for: ${email}`);
  } catch (err) {
    console.error('Failed to create admin account:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
