import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from '$env/static/private';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
	url: TURSO_CONNECTION_URL,
	authToken: TURSO_AUTH_TOKEN
});

export const db = drizzle(client);
