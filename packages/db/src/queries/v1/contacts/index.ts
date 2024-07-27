import { and, count, eq } from 'drizzle-orm';
import type { TContact, TUser } from 'schema/db';
import {
	GetContactsRequestV1Schema,
	PostContactsRequestV1Schema,
	PutContactsRequestV1Schema
} from 'schema/routes/api/v1/contacts/index';
import type { z } from 'zod';
import { contacts, listContactAssociation } from '~db/schema';
import { Database } from '~db/types';

async function getContacts(
	db: Database,
	userId: TUser['id'],
	{ page, itemsPerPage }: z.TypeOf<typeof GetContactsRequestV1Schema>
) {
	const [[{ total }], rows] = await Promise.all([
		db.select({ total: count() }).from(contacts).where(eq(contacts.userId, userId)),
		db
			.select()
			.from(contacts)
			.offset((page - 1) * itemsPerPage)
			.limit(itemsPerPage)
			.where(eq(contacts.userId, userId))
	]);

	return { total, contacts: rows };
}

async function postContact(
	db: Database,
	userId: TUser['id'],
	{ contact }: z.TypeOf<typeof PostContactsRequestV1Schema>
) {
	const [_contact] = await db
		.insert(contacts)
		.values({ ...contact, userId })
		.returning();

	return _contact;
}

async function deleteContact(db: Database, userId: TUser['id'], id: TContact['id']) {
	await db.transaction(async (tx) => {
		await tx.delete(listContactAssociation).where(eq(listContactAssociation.contactId, id));
		await tx.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
	});
	return {};
}

async function putContact(
	db: Database,
	userId: TUser['id'],
	id: TContact['id'],
	{ contact }: z.TypeOf<typeof PutContactsRequestV1Schema>
) {
	const [_contact] = await db
		.update(contacts)
		.set(contact)
		.where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
		.returning();

	return _contact;
}

export { deleteContact, getContacts, postContact, putContact };
