import { isOnline } from '$/stores/online';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { get } from '@square/svelte-store';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';
import type { TUser } from 'schema/db';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
	const token = localStorage.getItem('jwtToken');
	if (token === null) {
		if (event.route.id?.includes('(protected)')) {
			redirect(307, '/signin');
		}
		return { user: null };
	}
	const { user = null } = get(isOnline)
		? GetSessionResponseV1Schema.parse(
				await event
					.fetch(PUBLIC_API_BASE_URL + '/api/v1/get-session', {
						headers: {
							Authorization: `Bearer ${token}`
						}
					})
					.then((res) => res.json())
			)
		: (jwtDecode(token) as { user: TUser });

	if (user === undefined) {
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
