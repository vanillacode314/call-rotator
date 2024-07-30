import { count, eq } from 'drizzle-orm';
import type { TUser } from 'schema/db';
import {
	GetContactsRequestV1Schema,
	PostContactRequestV1Schema
} from 'schema/routes/api/v1/contacts/index';
import type { z } from 'zod';
import { contacts } from '~db/schema';
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
	{ contact }: z.TypeOf<typeof PostContactRequestV1Schema>
) {
	const [_contact] = await db
		.insert(contacts)
		.values({ ...contact, userId })
		.returning();

	return _contact;
}

export { getContacts, postContact };
