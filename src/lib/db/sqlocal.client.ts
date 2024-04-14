import { ROOT_NODE_ID } from '$/consts';
import { sql } from 'drizzle-orm';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { nodes } from './schema.sqlocal';

let firstRun: boolean = true;
let module: typeof import('./sqlocal.db');
async function getSQLocalClient() {
	if (!module) module = await import('./sqlocal.db');
	if (!firstRun) return module.db;

	firstRun = false;
	await seed(module.db);
	return module.db;
}

async function getRawSQLocalClient() {
	if (!module) module = await import('./sqlocal.db');
	return module.dbx;
}

async function seed(db: SqliteRemoteDatabase) {
	await db.run(sql`PRAGMA foreign_keys = ON;
						 CREATE TABLE IF NOT EXISTS nodes (
								id INTEGER PRIMARY KEY,
								name TEXT NOT NULL,
								parent_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
								metadata TEXT,
							  UNIQUE(name, parent_id)
						)`);
	await db
		.insert(nodes)
		.values({ name: 'root', parent_id: null, metadata: null, id: ROOT_NODE_ID })
		.onConflictDoNothing();
}

export { getRawSQLocalClient, getSQLocalClient };
