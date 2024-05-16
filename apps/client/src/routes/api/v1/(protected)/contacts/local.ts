import { DEFAULT_LOCAL_USER_ID } from '$/consts';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import { contacts } from 'db/schema';
import { count, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { deleteInputSchema, getInputSchema, postInputSchema, putInputSchema } from './schema';

async function getContacts(inputs: z.TypeOf<typeof getInputSchema>) {
	const { page, itemsPerPage } = getInputSchema.parse(inputs);

	const db = await getSQLocalClient();
	const [[{ total }], rows] = await Promise.all([
		db.select({ total: count() }).from(contacts),
		db
			.select()
			.from(contacts)
			.offset((page - 1) * itemsPerPage)
	]);

	return { total, contacts: rows };
}

async function postContact(inputs: z.TypeOf<typeof postInputSchema>) {
	const { contact } = postInputSchema.parse(inputs);

	const db = await getSQLocalClient();
	const [_contact] = await db
		.insert(contacts)
		.values({ ...contact, userId: DEFAULT_LOCAL_USER_ID })
		.returning();

	return _contact;
}

async function deleteContact(inputs: z.TypeOf<typeof deleteInputSchema>) {
	const { id } = deleteInputSchema.parse(inputs);

	const db = await getSQLocalClient();
	await db.delete(contacts).where(eq(contacts.id, id));

	return {};
}

async function putContact(inputs: z.TypeOf<typeof putInputSchema>) {
	const { contact } = putInputSchema.parse(inputs);

	const db = await getSQLocalClient();

	const [_contact] = await db
		.update(contacts)
		.set(contact)
		.where(eq(contacts.id, contact.id))
		.returning();

	return _contact;
}

export { deleteContact, getContacts, postContact, putContact };
