import { sql, transaction } from '.'

const VALID_TABLES = ['contacts', 'folders', 'files'] as const

export async function initDB() {
	await pruneDB()
	await transaction((sql) => [
		sql`CREATE TABLE IF NOT EXISTS contacts (
      phone TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )`,
		sql`CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES folders(id),
      UNIQUE(name, parent_id)
    )`,
		sql`CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INTEGER NOT NULL REFERENCES folders(id),
      metadata JSONB,
      UNIQUE(name, parent_id)
    )`,
		sql`INSERT OR IGNORE INTO folders (name) VALUES ('root')`
	])
}

export async function pruneDB() {
	const tables =
		await sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
	const tableNames = tables.map((row) => row.name).filter((name) => !VALID_TABLES.includes(name))
	if (tableNames.length > 0)
		// @ts-ignore
		await sql([tableNames.map((name) => `DROP TABLE IF EXISTS ${name}`).join(';')])
}
