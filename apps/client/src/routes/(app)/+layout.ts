import { isOnline } from '$/stores/online';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { get } from '@square/svelte-store';
import { redirect } from '@sveltejs/kit';
import { GetSessionResponseV1 } from 'proto/api/v1/get-session';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (event) => {
	const { user = undefined } = get(isOnline)
		? GetSessionResponseV1.fromBinary(
				await event
					.fetch(PUBLIC_API_BASE_URL + '/api/v1/get-session', {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
						}
					})
					.then((res) => res.arrayBuffer())
					.then((buf) => new Uint8Array(buf))
			)
		: {};

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
