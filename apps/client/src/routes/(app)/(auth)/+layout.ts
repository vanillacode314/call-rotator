import { createFetcher } from '$/utils/zod';
import { browser } from '$app/environment';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
	if (!browser) {
		const { user } = await event.parent();
		return { user };
	}
	const fetcher = createFetcher(event.fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});
	const { user } = await fetcher(
		GetSessionResponseV1Schema,
		PUBLIC_API_BASE_URL + '/api/v1/get-session'
	);
	if (user) {
		redirect(307, '/');
	}
	return { user };
};
