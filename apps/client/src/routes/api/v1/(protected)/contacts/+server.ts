import { json } from '@sveltejs/kit';
import { contacts } from 'db/schema';
import { count, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getInputSchema } from './schema';

export const GET = (async (event) => {
	const result = getInputSchema.safeParse(Object.fromEntries(event.url.searchParams.entries()));

	if (!result.success) {
		return json(
			{
				success: false,
				status: 400,
				errors: result.error.errors.map((e) => ({ message: e.message, code: 'INVALID_QUERY' }))
			},
			{ status: 400 }
		);
	}

	const { page, itemsPerPage } = result.data;
	const db = event.locals.db;
	const [[{ total }], rows] = await db.batch([
		db.select({ total: count() }).from(contacts).where(eq(contacts.userId, event.locals.user.id)),
		db
			.select()
			.from(contacts)
			.offset((page - 1) * itemsPerPage)
			.limit(itemsPerPage)
			.where(eq(contacts.userId, event.locals.user.id))
	]);
	return json({ status: 200, success: true, data: { total, contacts: rows } });
}) satisfies RequestHandler;
