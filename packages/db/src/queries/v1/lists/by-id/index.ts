import { and, eq } from 'drizzle-orm';
import { type TList, type TUser } from 'schema/db';
import { PutListByIdRequestV1Schema } from 'schema/routes/api/v1/lists/by-id';
import type { z } from 'zod';
import { contacts, listContactAssociation, lists } from '~db/schema';
import { Database } from '~db/types';

async function getListById(db: Database, userId: TUser['id'], id: TList['id']) {
	const [list] = await db
		.select()
		.from(lists)
		.where(and(eq(lists.id, id), eq(lists.userId, userId)))
		.limit(1);
	if (!list) return null;
	const rows = await db
		.select()
		.from(listContactAssociation)
		.innerJoin(contacts, eq(contacts.id, listContactAssociation.contactId))
		.innerJoin(lists, eq(lists.id, listContactAssociation.listId))
		.where(eq(lists.id, list.id));
	return { list, contacts: rows.map(({ contacts }) => contacts) };
}
async function putList(
	db: Database,
	userId: TUser['id'],
	id: TList['id'],
	{ list }: z.TypeOf<typeof PutListByIdRequestV1Schema>
): Promise<TList | null> {
	const [_list] = await db
		.update(lists)
		.set(list)
		.where(and(eq(lists.id, id), eq(lists.userId, userId)))
		.returning();
	return _list ?? null;
}

async function deleteList(db: Database, userId: TUser['id'], id: TList['id']) {
	const [_list] = await db
		.delete(lists)
		.where(and(eq(lists.userId, userId), eq(lists.id, id)))
		.returning();
	return _list;
}

export { deleteList, getListById, putList };
