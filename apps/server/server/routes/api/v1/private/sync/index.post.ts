import { contacts, lists, nodes } from 'db/schema';
import { and, eq, gt, sql, TableConfig } from 'drizzle-orm';
import {
	IndexColumn,
	SQLiteInsertValue,
	SQLiteTable,
	SQLiteTableWithColumns,
	SQLiteUpdateSetSource
} from 'drizzle-orm/sqlite-core';
import { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import jwt from 'jsonwebtoken';
import { ApiErrorCodeSchema } from 'schema/api';
import { contactSchema, listSchema, nodeSchema } from 'schema/db';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import { z } from 'zod';

async function upsert<T extends TableConfig, U extends SQLiteTable<T>>(
	db: SqliteRemoteDatabase,
	table: SQLiteTableWithColumns<T>,
	values: SQLiteInsertValue<U>,
	target: IndexColumn | IndexColumn[],
	userId: number
) {
	const parsedValues = values.map((el) => ({
		...omitKeys(el, ['createdAt', 'updatedAt']),
		userId: userId
	}));
	const keys = Object.keys(omitKeys(parsedValues[0], ['userId']));
	const upsertCondition = Object.fromEntries(
		keys.filter((key) => key !== 'id').map((key) => [key, sql.raw(`excluded.${key}`)])
	) as SQLiteUpdateSetSource<typeof table>;
	console.log(upsertCondition);
	await db
		.insert(table)
		.values(parsedValues)
		.onConflictDoUpdate({
			target: target,
			set: upsertCondition,
			setWhere: sql`excluded.updatedAt > ${table.updatedAt}`
		});
}

function omitKeys<T extends Record<string, unknown>>(
	obj: T,
	keys: (keyof T | (string & {}))[]
): Omit<T, (typeof keys)[number]> {
	const copy = { ...obj };
	for (const key of keys) {
		delete copy[key];
	}
	return copy;
}

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(
		event,
		z.object({
			updatedContacts: contactSchema.array(),
			updatedNodes: nodeSchema.array(),
			updatedLists: listSchema.array()
		}).safeParse
	);

	if (!result.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result: {
				issues: result.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_FORMDATA
				}))
			}
		};
	}
	const user = event.context.user;

	let { updatedContacts, updatedNodes, updatedLists } = result.data;

	if (updatedContacts.length > 0) {
		await upsert(db, contacts, updatedContacts, [contacts.phone, contacts.userId], user.id);
	}
	if (updatedNodes.length > 0) {
		await upsert(db, nodes, updatedNodes, [nodes.parentId, nodes.name, nodes.userId], user.id);
	}
	if (updatedLists.length > 0) {
		await upsert(db, lists, updatedLists, lists.id, user.id);
	}

	[updatedContacts, updatedNodes, updatedLists] = await Promise.all([
		db
			.select()
			.from(contacts)
			.where(
				!user.lastSyncAt
					? eq(contacts.userId, user.id)
					: and(eq(contacts.userId, user.id), gt(contacts.updatedAt, user.lastSyncAt))
			),
		db
			.select()
			.from(nodes)
			.where(
				!user.lastSyncAt
					? eq(nodes.userId, user.id)
					: and(eq(nodes.userId, user.id), gt(nodes.updatedAt, user.lastSyncAt))
			),
		db
			.select()
			.from(lists)
			.where(
				!user.lastSyncAt
					? eq(lists.userId, user.id)
					: and(eq(lists.userId, user.id), gt(lists.updatedAt, user.lastSyncAt))
			)
	]);

	const token = jwt.sign(
		GetSessionResponseV1Schema.shape.user
			.unwrap()
			.pick({ email: true, id: true, lastSyncAt: true })
			.parse({ ...user, lastSyncAt: new Date(0) }),
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
