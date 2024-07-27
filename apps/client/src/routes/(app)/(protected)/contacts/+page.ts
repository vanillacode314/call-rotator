import { DEFAULT_LOCAL_USER_ID } from '$/consts';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import { getContacts } from 'db/queries/v1/contacts/index';
import type { PageLoad } from './$types';

const ITEMS_PER_PAGE = 20;
export const load = (async (event) => {
	const { user } = await event.parent();
	const page = +(event.url.searchParams.get('page') ?? 1);
	const itemsPerPage = +(event.url.searchParams.get('itemsPerPage') ?? ITEMS_PER_PAGE);

	let contacts: TContact[] = [];
	let total: number = 0;
	const db = await getSQLocalClient();
	({ total, contacts } = await getContacts(db, DEFAULT_LOCAL_USER_ID, { page, itemsPerPage }));
	for (const { id } of contacts) {
		event.depends(`contact:${id}`);
	}

	return { contacts, total, itemsPerPage, page };
}) satisfies PageLoad;
