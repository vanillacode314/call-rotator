import { db } from '$/lib/db/libsql.db';
import { getContacts } from 'db/queries/v1/contacts/index';
import type { TContact } from 'schema/db';
import type { PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 20;
export const load = (async (event) => {
	event.depends(`contacts:contacts`);
	const user = event.locals.user;
	const page = +(event.url.searchParams.get('page') ?? 1);
	const itemsPerPage = +(event.url.searchParams.get('itemsPerPage') ?? ITEMS_PER_PAGE);

	let contacts: TContact[] = [];
	let total: number = 0;
	({ total, contacts } = await getContacts(db, user.id, { page, itemsPerPage }));
	for (const { id } of contacts) {
		event.depends(`contact:${id}`);
	}

	return { contacts, total, itemsPerPage, page };
}) satisfies PageServerLoad;
