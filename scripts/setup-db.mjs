import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local if present
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...values] = trimmed.split('=');
    if (key && values.length > 0) {
      const val = values.join('=').replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nature_house';

console.log('🌿 Nature House — Local Database Setup & Seeding');
console.log('──────────────────────────────────────────────────');
console.log(`Connecting to: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);

const { Client } = pg;
const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');

    // 1. Run Schema
    const schemaFile = path.join(rootDir, 'database', 'schema.sql');
    console.log('📦 Executing database/schema.sql...');
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema tables, triggers, and indexes created successfully!\n');

    // 2. Run Seed
    const seedFile = path.join(rootDir, 'database', 'seed.sql');
    console.log('🌱 Executing database/seed.sql...');
    const seedSql = fs.readFileSync(seedFile, 'utf8');
    await client.query(seedSql);
    console.log('✅ Seed data inserted successfully!\n');

    // 3. Verify Table Counts
    const categoriesCount = await client.query('SELECT COUNT(*) FROM public.categories');
    const plantsCount = await client.query('SELECT COUNT(*) FROM public.plants');
    const aquariumsCount = await client.query('SELECT COUNT(*) FROM public.aquariums');
    const settingsCheck = await client.query('SELECT key FROM public.site_settings');

    console.log('📊 Verification Summary:');
    console.log(`   • Categories in DB: ${categoriesCount.rows[0].count}`);
    console.log(`   • Plants in DB:     ${plantsCount.rows[0].count}`);
    console.log(`   • Aquariums in DB:  ${aquariumsCount.rows[0].count}`);
    console.log(`   • Settings Active:  ${settingsCheck.rows.map((r) => r.key).join(', ')}`);
    console.log('\n🎉 Phase 2 Database Setup is Complete & Ready for Testing!');
  } catch (err) {
    console.error('\n❌ Database Setup Error:');
    console.error(err.message);
    console.error('\nTips:');
    console.error('1. Verify your PostgreSQL service is running.');
    console.error('2. Ensure the "nature_house" database exists (run: CREATE DATABASE nature_house;).');
    console.error('3. Check username & password in .env.local (DATABASE_URL=postgresql://user:pass@localhost:5432/nature_house).');
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
