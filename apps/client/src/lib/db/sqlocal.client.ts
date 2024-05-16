import { showMigrateModal } from '$/components/modals/MigrationModal.svelte';
import { ROOT_NODE_ID } from '$/consts';
import { sql } from 'drizzle-orm';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { nodes, users } from './schema';
import { MIGRATIONS } from './sqlocal.migrations';

let firstRun: boolean = true;
let module: typeof import('./sqlocal.db');
async function getSQLocalClient() {
	if (!module) module = await import('./sqlocal.db');
	if (!firstRun) return module.db;

	firstRun = false;
	await runMigrations(module.db);
	await seed(module.db);
	return module.db;
}

async function getRawSQLocalClient() {
	if (!module) module = await import('./sqlocal.db');
	return module.dbx;
}

async function runMigrations(db: SqliteRemoteDatabase) {
	await db.run(sql`PRAGMA foreign_keys = ON`);
	await db.run(sql.raw(MIGRATIONS[0]));
	const [n]: [number] = await db.get(sql`
		SELECT
		  count(*)
		FROM
		  migrations`);
	const SHOW_MODAL = n > 0 && MIGRATIONS.length - n > 1;

	if (SHOW_MODAL) {
		showMigrateModal(MIGRATIONS.slice(n + 1));
	} else {
		for (const migration of MIGRATIONS.slice(n + 1)) {
			await db.run(sql.raw(migration));
			await db.run(sql`
										INSERT INTO
										  migrations (timestamp)
										VALUES
										  ((datetime ('now')))`);
		}
	}
}

async function seed(db: SqliteRemoteDatabase) {
	await db
		.insert(users)
		.values({
			email: 'local@local.com',
			password: 'password',
			id: 0,
			emailVerified: sql`datetime ('now')`
		})
		.onConflictDoNothing();
	await db
		.insert(nodes)
		.values({ name: 'root', parentId: null, listId: null, id: ROOT_NODE_ID, userId: 0 })
		.onConflictDoNothing();
}

export { getRawSQLocalClient, getSQLocalClient };
