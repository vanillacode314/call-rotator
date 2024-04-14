import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { SQLocalDrizzle } from 'sqlocal/drizzle';

const dbx = new SQLocalDrizzle('database.sqlite3');
const db = drizzle(dbx.driver);

function reset() {
	return navigator.storage
		.getDirectory()
		.then((root) => root.removeEntry('database.sqlite3', { recursive: true }));
}

export { db, dbx, reset };
