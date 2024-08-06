import * as path from '$/utils/path';
import { createFetcher } from '$/utils/zod';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { TContact, TList } from 'schema/db';
import { GetListByPathResponseV1Schema } from 'schema/routes/api/v1/lists/by-path';
import type { PageLoad } from './$types';

export const load = (async (event) => {
	const { user } = await event.parent();
	const pwd = encodeURI(`${path.join('/', event.params.path, event.params.list_name + '.list')}`);
	event.depends(`list:${pwd}`);
	let list: TList | null = null;
	let contacts: TContact[] = [];
	const fetcher = createFetcher(event.fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});
	const { result, success, status } = await fetcher(
		GetListByPathResponseV1Schema,
		`${PUBLIC_API_BASE_URL}/api/v1/private/lists/by-path?path=${pwd}`
	);
	if (!success) error(status, result.issues.join(';'));
	({ list, contacts } = result);
	for (const { id } of contacts) {
		event.depends(`contact:${id}`);
	}

	return { list, contacts, pwd };
}) satisfies PageLoad;
