import { contacts, lists, nodes } from 'db/schema';
import { and, eq, gt, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';

export default defineEventHandler(async (event) => {
	const user = event.context.user;

	const updatedContacts = await db
		.select()
		.from(contacts)
		.where(
			!user.lastSyncAt
				? eq(contacts.userId, user.id)
				: and(
						eq(contacts.userId, user.id),
						gt(contacts.updatedAt, sql`${user.lastSyncAt.toISOString()}`)
					)
		);

	const updatedNodes = await db
		.select()
		.from(nodes)
		.where(
			!user.lastSyncAt
				? eq(nodes.userId, user.id)
				: and(eq(nodes.userId, user.id), gt(nodes.updatedAt, sql`${user.lastSyncAt.toISOString()}`))
		);

	const updatedLists = await db
		.select()
		.from(lists)
		.where(
			!user.lastSyncAt
				? eq(lists.userId, user.id)
				: and(eq(lists.userId, user.id), gt(lists.updatedAt, sql`${user.lastSyncAt.toISOString()}`))
		);

	const token = jwt.sign(
		GetSessionResponseV1Schema.shape.user
			.unwrap()
			.pick({ email: true, id: true, lastSyncAt: true })
			.parse({ ...user, lastSyncAt: null }),
		env.AUTH_SECRET,
		{
			expiresIn: Math.floor(user.exp - Date.now() / 1000)
		}
	);
	return {
		success: true,
		status: 200,
		result: { token, updatedNodes, updatedLists, updatedContacts }
	};
});
