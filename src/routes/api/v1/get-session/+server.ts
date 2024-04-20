import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSession } from './utils';

export const GET = (async (event) => {
	const token = event.cookies.get('sessionToken');
	const session = await getSession(token, event.locals.db);
	return json({
		data: session
	});
}) satisfies RequestHandler;
