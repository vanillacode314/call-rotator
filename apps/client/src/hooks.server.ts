import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import { createFetcher } from './utils/zod';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwtToken') ?? null;
	if (token === null) {
		event.locals.user = null;
		if (event.route.id?.includes('(protected)')) {
			redirect(307, '/signin');
		}
	}
	const fetcher = createFetcher(event.fetch, {
		headers: {
			'Content-Type': 'application/json',
			Cookie: `jwtToken=${token}`
		}
	});
	const { user } = await fetcher(
		GetSessionResponseV1Schema,
		PUBLIC_API_BASE_URL + '/api/v1/get-session'
	);
	if (!user) {
		if (event.route.id?.includes('(protected)')) {
			redirect(307, '/signin');
		}
	} else {
		if (event.route.id?.includes('(auth)')) {
			redirect(307, '/');
		}
	}
	event.locals.user = user;
	const response = await resolve(event);
	return response;
};
