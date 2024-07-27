import { and, eq, inArray } from 'drizzle-orm';
import type { TContact, TList } from 'schema/db';
import { listContactAssociation } from '~db/schema';
import { Database } from '~db/types';

async function deleteListContactById(
	db: Database,
	listId: TList['id'],
	contactIds: TContact['id'][]
) {
	await db
		.delete(listContactAssociation)
		.where(
			and(
				inArray(listContactAssociation.contactId, contactIds),
				eq(listContactAssociation.listId, listId)
			)
		);

	return {};
}

export { deleteListContactById };
