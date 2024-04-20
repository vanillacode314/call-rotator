import { json, redirect, type Handle } from '@sveltejs/kit';
import { db } from './lib/db/libsql.db';
import { getSession } from './routes/api/v1/get-session/utils';
import { createFetcher } from './utils/zod';

const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = db;
	if (event.url.pathname === '/api/v1/get-session') {
		return resolve(event);
	}
	const fetcher = createFetcher(event.fetch);
	const token = event.cookies.get('sessionToken');
	event.locals.user = await getSession(token, db);
	event.locals.mode = event.cookies.get('mode') === 'offline' ? 'offline' : 'online';
	if (event.cookies.get('mode') === undefined)
		event.cookies.set('mode', event.locals.mode, { path: '/', httpOnly: false, secure: true });

	if (event.locals.mode === 'online') {
		if (event.locals.user === null) {
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
