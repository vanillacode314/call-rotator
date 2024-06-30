import { isServer } from '$/consts/sveltekit';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import { getContacts } from 'db/queries/v1/contacts/index';
import type { PageLoad } from './$types';

const ITEMS_PER_PAGE = 20;
export const load = (async (event) => {
	event.depends('contacts:contacts');
	const { user } = await event.parent();
	const page = +(event.url.searchParams.get('page') ?? 1);
	const itemsPerPage = +(event.url.searchParams.get('itemsPerPage') ?? ITEMS_PER_PAGE);

	let contacts: TContact[] = [];
	let total: number = 0;
	if (isServer) {
	} else {
		const db = await getSQLocalClient();
		({ total, contacts } = await getContacts(db, user!.id, { page, itemsPerPage }));
	}

	return { contacts, total };
}) satisfies PageLoad;
