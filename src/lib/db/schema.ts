import { isServer } from '$/consts/sveltekit';
import { getSQLocalDB } from '.';

const TABLES = {
	contacts: `
		phone TEXT PRIMARY KEY,
		name TEXT UNIQUE NOT NULL
	`,
	folders: `
		id INTEGER PRIMARY KEY,
		name TEXT NOT NULL,
		parent_id INTEGER REFERENCES folders(id),
		UNIQUE(name, parent_id)
	`,
	files: `
		id INTEGER PRIMARY KEY,
		name TEXT NOT NULL,
		parent_id INTEGER NOT NULL REFERENCES folders(id),
		metadata JSONB,
		UNIQUE(name, parent_id)
	`
};
const VALID_TABLES = Object.keys(TABLES);

export async function initDB() {
	await pruneDB();
	if (isServer) return;
	const { transaction } = await getSQLocalDB();
	await transaction((sql) => [
		...Object.entries(TABLES).map(([name, schema]) =>
			sql([`CREATE TABLE IF NOT EXISTS ${name} (${schema})`])
		),
		sql`INSERT OR IGNORE INTO folders (name) VALUES ('root')`
	]);
}

export async function pruneDB() {
	if (isServer) return;
	const { sql } = await getSQLocalDB();
	const tables =
		await sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`;
	const tableNames = tables.map((row) => row.name).filter((name) => !VALID_TABLES.includes(name));
	if (tableNames.length > 0)
		// @ts-ignore
		await sql([tableNames.map((name) => `DROP TABLE IF EXISTS ${name}`).join(';')]);
}
