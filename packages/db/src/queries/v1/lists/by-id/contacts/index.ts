import { and, eq, inArray } from 'drizzle-orm';
import type { TList, TUser } from 'schema/db';
import { PostListContactByIdRequestV1Schema } from 'schema/routes/api/v1/lists/by-id/contacts';
import type { z } from 'zod';
import { contacts, listContactAssociation } from '~db/schema';
import { Database } from '~db/types';

function postListContactById(
	db: Database,
	userId: TUser['id'],
	listId: TList['id'],
	{ contactIds }: z.TypeOf<typeof PostListContactByIdRequestV1Schema>
) {
	return db.transaction(async (tx) => {
		const _contacts = await tx
			.select()
			.from(contacts)
			.where(and(inArray(contacts.id, contactIds), eq(contacts.userId, userId)));
		await tx
			.insert(listContactAssociation)
			.values(_contacts.map(({ id: contactId }) => ({ listId, contactId })));
		return _contacts;
	});
}

export { postListContactById };
