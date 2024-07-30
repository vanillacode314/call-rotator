import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import type { SQLocalDrizzle } from 'sqlocal/drizzle';

const CACHE: Record<string, [SQLocalDrizzle, SqliteRemoteDatabase<Record<string, never>>]> = {};

async function getDb(path: string) {
	const { drizzle } = await import('drizzle-orm/sqlite-proxy');
	const { SQLocalDrizzle } = await import('sqlocal/drizzle');
	if (CACHE[path]) return CACHE[path];
	const rawDb = new SQLocalDrizzle(path);
	const db = drizzle(rawDb.driver);
	CACHE[path] = [rawDb, db] as const;
	return CACHE[path];
}

function resetDb(path: string) {
	return navigator.storage
		.getDirectory()
		.then((root) => root.removeEntry(path, { recursive: true }));
}

export { getDb, resetDb };
