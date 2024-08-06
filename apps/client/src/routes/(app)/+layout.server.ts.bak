import { createFetcher } from '$/utils/zod';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const token = event.cookies.get('jwtToken');
	if (!token) {
		if (event.route.id?.includes('(protected)')) {
			redirect(307, '/signin');
		}
	}
	const fetcher = createFetcher(fetch, {
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
	return { user };
};
