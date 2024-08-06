import { createFetcher } from '$/utils/zod';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import { GetContactsResponseV1Schema } from 'schema/routes/api/v1/contacts/index';
import type { PageLoad } from './$types';

const ITEMS_PER_PAGE = 20;
export const load = (async (event) => {
	event.depends(`contacts:contacts`);
	const { user } = await event.parent();
	const page = +(event.url.searchParams.get('page') ?? 1);
	const itemsPerPage = +(event.url.searchParams.get('itemsPerPage') ?? ITEMS_PER_PAGE);

	const fetcher = createFetcher(event.fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});

	const searchParams = new URLSearchParams({
		page: String(page),
		itemsPerPage: String(itemsPerPage)
	});
	const { result, success, status } = await fetcher(
		GetContactsResponseV1Schema,
		`${PUBLIC_API_BASE_URL}/api/v1/private/contacts?${searchParams.toString()}`
	);
	if (!success) error(status, result.issues.join(';'));

	const { contacts, total } = result;
	for (const { id } of contacts) {
		event.depends(`contact:${id}`);
	}
	return { contacts, total, itemsPerPage, page };
}) satisfies PageLoad;
