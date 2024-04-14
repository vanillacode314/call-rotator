import { json, redirect, type Handle } from '@sveltejs/kit';
import { db } from './lib/db/libsql.db';
import { responseSchema as getSessionResponseSchema } from './routes/api/v1/get-session/schema';
import { createFetcher } from './utils/zod';

const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = db;
	if (event.url.pathname === '/api/v1/get-session') {
		return resolve(event);
	}
	const fetcher = createFetcher(event.fetch);
	const { data: user } = await fetcher(getSessionResponseSchema, '/api/v1/get-session');
	event.locals.user = user;
	event.locals.mode = event.cookies.get('mode') === 'offline' ? 'offline' : 'online';
	if (event.cookies.get('mode') === undefined)
		event.cookies.set('mode', event.locals.mode, { path: '/', httpOnly: false });

	if (event.locals.mode === 'online') {
		if (user === null) {
			if (event.route.id?.includes('api') && event.route.id?.includes('(protected)')) {
				return json(
					{
						success: false,
						status: 401,
						errors: [{ message: 'Unauthorized', code: 'UNAUTHORIZED' }]
					},
					{ status: 401 }
				);
			}
			if (event.route.id?.includes('(protected)')) {
				redirect(307, '/signin');
			}
		} else {
			if (event.route.id?.includes('(auth)')) {
				redirect(307, '/');
			}
		}
	} else {
		if (event.route.id?.includes('(auth)')) {
			redirect(307, '/');
		}
	}

	const response = await resolve(event);
	if (event.locals.mode === 'offline') {
		response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
		response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	}
	return response;
};

export { handle };
