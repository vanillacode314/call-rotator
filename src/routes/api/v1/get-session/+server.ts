import { sessions, users } from '$/lib/db/schema.libsql';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET = (async (event) => {
	const token = event.cookies.get('sessionToken');
	if (!token) {
		return json({
			data: null
		});
	}

	const db = event.locals.db;

	const [user] = await db
		.select({ id: users.id, email: users.email })
		.from(sessions)
		.leftJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.token, token));

	return json({ data: user ?? null });
}) satisfies RequestHandler;
