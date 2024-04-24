import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	event.cookies.delete('jwtToken', { path: '/' });
	return redirect(307, '/signin');
}) satisfies RequestHandler;
