import { Hymn, HymnalCollection } from '../types';

/**
 * Fallback service for hymnal queries.
 * Hymnal data is managed dynamically via high-performance JSON catalogs
 * in src/lib/hymnLibrary.ts with zero WebAssembly/CDN overhead.
 */
export async function getSqliteDb(): Promise<null> {
  return null;
}

export async function executeSqliteQuery(
  _sql: string,
  _params: (string | number | null)[] = []
): Promise<Record<string, any>[]> {
  return [];
}

export async function fetchHymnsFromSqlite(_collectionCode: string): Promise<Hymn[]> {
  return [];
}
