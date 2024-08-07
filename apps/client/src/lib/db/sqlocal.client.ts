import { showMigrateModal } from '$/components/modals/MigrationModal.svelte';
import { DEFAULT_LOCAL_USER_ID } from '$/consts';
import { nodes, users } from 'db/schema';
import { and, eq, sql } from 'drizzle-orm';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { MIGRATIONS } from './sqlocal.migrations';

let firstRun: boolean = true;
let module: typeof import('./sqlocal.db');
async function getSQLocalClient(path = 'database.sqlite3') {
	if (!module) module = await import('./sqlocal.db');
	if (!firstRun) return module.getDb(path);

	const [rawDb, db] = await module.getDb(path);
	firstRun = false;
	await runMigrations(db);
	await seed(db);
	return [rawDb, db] as const;
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
			.values({ id: 0, name: 'root', parentId: null, listId: null, userId })
			.onConflictDoNothing();
}

export { getSQLocalClient, seed };
