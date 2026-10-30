import type { D1Database } from '@cloudflare/workers-types';

/** Thin typed SQL, not a repository abstraction. Only foundation queries belong here. */
export async function probeDatabase(database: D1Database): Promise<boolean> {
  const result = await database.prepare('SELECT 1 AS ok').first<{ ok: number }>();
  return result?.ok === 1;
}