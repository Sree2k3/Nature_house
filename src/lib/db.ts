import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export class PersistenceError extends Error {
  public readonly code: string;
  public readonly originalError?: unknown;

  constructor(message: string, code = 'DB_ERROR', originalError?: unknown) {
    super(message);
    this.name = 'PersistenceError';
    this.code = code;
    this.originalError = originalError;
  }
}

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.warn('[Nature House DB Pool Error]:', err.message);
    });

    return pool;
  } catch (error) {
    console.warn('[Nature House DB Init Warning]:', error);
    return null;
  }
}

/**
 * Execute a parameterized SQL query with explicit error propagation.
 * Throws PersistenceError if the connection or query fails.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const currentPool = getDbPool();
  if (!currentPool) {
    throw new PersistenceError('Database connection pool is not configured (DATABASE_URL missing)', 'DB_NOT_CONFIGURED');
  }

  let client: PoolClient;
  try {
    client = await currentPool.connect();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new PersistenceError(`Database connection failed: ${msg}`, 'DB_CONNECTION_FAILED', err);
  }

  try {
    const result = await client.query<T>(text, params);
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new PersistenceError(`Database query failed: ${msg}`, 'DB_QUERY_FAILED', err);
  } finally {
    client.release();
  }
}

/**
 * Transaction helper for coordinating multi-statement atomic operations.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const currentPool = getDbPool();
  if (!currentPool) {
    throw new PersistenceError('Database pool is not configured', 'DB_NOT_CONFIGURED');
  }

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err instanceof PersistenceError ? err : new PersistenceError('Transaction failed and was rolled back', 'DB_TRANSACTION_FAILED', err);
  } finally {
    client.release();
  }
}

/**
 * Health check helper to test database connectivity safely.
 */
export async function testConnection(): Promise<{ ok: boolean; message: string; timestamp?: string }> {
  try {
    const result = await query<{ now: string }>('SELECT NOW() as now');
    if (result && result.rows.length > 0) {
      return {
        ok: true,
        message: 'Connected to local PostgreSQL database',
        timestamp: result.rows[0].now,
      };
    }
    return {
      ok: false,
      message: 'Database returned empty response',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Database connection failed: ${message}`,
    };
  }
}
