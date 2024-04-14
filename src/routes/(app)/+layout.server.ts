import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	return {
		mode: event.locals.mode,
		user: event.locals.user
	};
}) satisfies LayoutServerLoad;
