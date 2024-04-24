import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSession } from './utils';

export const GET = (async (event) =>
	json({
		data: await getSession(event.cookies.get('jwtToken'))
	})) satisfies RequestHandler;
