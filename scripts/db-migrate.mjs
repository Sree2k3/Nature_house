import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local if present
const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db-migrate] ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

// Safety check: local development only
const isLocal =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes(':5432');

if (!isLocal) {
  console.warn('[db-migrate] WARNING: Non-local database connection string detected. Refusing to run migrations on unconfirmed target.');
  process.exit(1);
}

async function runMigrations() {
  const client = new pg.Client({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('[db-migrate] Connected to local PostgreSQL.');

    // 1. Ensure migrations ledger exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
    `);

    // 2. Read migration files
    const migrationsDir = path.join(rootDir, 'database', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[db-migrate] No database/migrations directory found.');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: executed } = await client.query('SELECT name FROM public.schema_migrations');
    const executedSet = new Set(executed.map((r) => r.name));

    let count = 0;
    for (const file of files) {
      if (!executedSet.has(file)) {
        console.log(`[db-migrate] Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO public.schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[db-migrate] Successfully applied: ${file}`);
          count++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[db-migrate] FAILED applying ${file}:`, err.message);
          throw err;
        }
      } else {
        console.log(`[db-migrate] Already executed: ${file}`);
      }
    }

    console.log(`[db-migrate] Migration complete. Applied ${count} new migration(s).`);
  } catch (err) {
    console.error('[db-migrate] Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
