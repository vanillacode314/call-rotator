import { sessions } from '$/lib/db/schema.libsql';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	const token = event.cookies.get('sessionToken');
	if (!token) return new Response();
	event.cookies.delete('sessionToken', { path: '/' });
	const db = event.locals.db;

	await db.delete(sessions).where(eq(sessions.token, token));
	return redirect(307, '/signin');
}) satisfies RequestHandler;
