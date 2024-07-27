import { showMigrateModal } from '$/components/modals/MigrationModal.svelte';
import { DEFAULT_LOCAL_USER_ID } from '$/consts';
import { and, eq, sql } from 'drizzle-orm';
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
	// console.log(await module.db.select().from(listContactAssociation));
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

async function seed(db: SqliteRemoteDatabase, userId = DEFAULT_LOCAL_USER_ID) {
	await db
		.insert(users)
		.values({
			email: 'local@local.com',
			password: 'password',
			id: userId,
			emailVerified: sql`datetime ('now')`
		})
		.onConflictDoNothing();
	const rows = await db
		.select()
		.from(nodes)
		.where(and(eq(nodes.name, 'root'), eq(nodes.userId, userId)))
		.limit(1);
	if (rows.length === 0)
		await db
			.insert(nodes)
			.values({ name: 'root', parentId: null, listId: null, userId })
			.onConflictDoNothing();
}

export { getRawSQLocalClient, getSQLocalClient, seed };
