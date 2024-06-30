import { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

type Database<T extends Record<string, unknown> = Record<string, unknown>> =
	SqliteRemoteDatabase<T>;

export { Database };
