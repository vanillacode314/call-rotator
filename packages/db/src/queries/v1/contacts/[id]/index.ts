import { and, eq } from 'drizzle-orm';
import type { TContact, TUser } from 'schema/db';
import {
	GetContactRequestV1Schema,
	PutContactRequestV1Schema
} from 'schema/routes/api/v1/contacts/[id]/index';
import type { z } from 'zod';
import { contacts, listContactAssociation } from '~db/schema';
import { Database } from '~db/types';

function getContact(
	db: Database,
	userId: TUser['id'],
	id: TContact['id'],
	{}: z.TypeOf<typeof GetContactRequestV1Schema>
) {
	return db
		.select()
		.from(contacts)
		.where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
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
	{ contact }: z.TypeOf<typeof PutContactRequestV1Schema>
) {
	const [_contact] = await db
		.update(contacts)
		.set(contact)
		.where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
		.returning();

	return _contact;
}

export { deleteContact, getContact, putContact };
