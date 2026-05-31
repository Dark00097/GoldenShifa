import mysql, { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env';

type DbExecutor = {
  execute(sql: string, values?: any[]): Promise<[any, any]>;
};

const databaseUrl = new URL(env.DATABASE_URL);

export const db = mysql.createPool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ''),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
  timezone: 'Z'
});

export async function rows<T = any>(sql: string, values: unknown[] = [], executor: DbExecutor = db): Promise<T[]> {
  const [result] = await executor.execute(sql, values as any[]);
  return result as T[];
}

export async function row<T = any>(sql: string, values: unknown[] = [], executor: DbExecutor = db): Promise<T | null> {
  const result = await rows<T>(sql, values, executor);
  return result[0] ?? null;
}

export async function exec(sql: string, values: unknown[] = [], executor: DbExecutor = db): Promise<ResultSetHeader> {
  const [result] = await executor.execute(sql, values as any[]);
  return result;
}

export async function transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function bool(value: unknown) {
  return Boolean(Number(value));
}

export function decimal(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

export function nullableDate(value: unknown) {
  return value ? new Date(value as string | number | Date) : null;
}
