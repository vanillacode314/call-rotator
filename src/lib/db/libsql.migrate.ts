import 'dotenv/config';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { resolve } from 'node:path';
import { db } from './libsql.db';

(async () => {
	await migrate(db, { migrationsFolder: resolve(__dirname, '../../../migrations') });
})();
