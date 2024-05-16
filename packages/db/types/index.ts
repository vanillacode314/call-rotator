import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';

type Database<T extends Record<string, unknown> = Record<string, unknown>> =
	| SqliteRemoteDatabase<T>
	| LibSQLDatabase<T>;

export { Database };
