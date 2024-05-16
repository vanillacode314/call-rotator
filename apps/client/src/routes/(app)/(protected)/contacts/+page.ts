import { isServer } from '$/consts/sveltekit';
import { getContacts } from '$/routes/api/v1/(protected)/contacts/local';
import { getOutputSchema as contactsGetOutputSchema } from '$/routes/api/v1/(protected)/contacts/schema';
import { createFetcher } from '$/utils/zod';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const ITEMS_PER_PAGE = 20;
export const load = (async (event) => {
	event.depends('contacts:contacts');
	const { mode } = await event.parent();
	const page = +(event.url.searchParams.get('page') ?? 1);

	let contacts: TContact[] = [];
	let total: number = 0;
	if (mode === 'offline') {
		if (isServer) {
		} else {
			({ total, contacts } = await getContacts({ page, itemsPerPage: ITEMS_PER_PAGE }));
		}
	} else {
		const fetcher = createFetcher(event.fetch);
		const searchParams = new URLSearchParams({
			page: page.toString(),
			itemsPerPage: ITEMS_PER_PAGE.toString()
		});
		const result = await fetcher(
			contactsGetOutputSchema,
			'/api/v1/nodes/by-path?' + searchParams.toString()
		);
		if (!result.success) {
			error(result.status, result.errors.map((e) => e.message).join('\n'));
		}
		({ total, contacts } = result.data);
	}

	return { contacts, total };
}) satisfies PageLoad;
