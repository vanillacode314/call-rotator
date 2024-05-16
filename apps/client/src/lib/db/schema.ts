import { sql } from 'drizzle-orm';
import {
	int,
	primaryKey,
	sqliteTable,
	text,
	unique,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const users = sqliteTable('users', {
	id: int('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	password: text('password').notNull(),
	emailVerified: int('emailVerified', { mode: 'timestamp_ms' })
	// image: text('image')
});

const verificationTokens = sqliteTable(
	'verificationTokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: int('expires', { mode: 'timestamp_ms' }).notNull()
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
	})
);

const nodes = sqliteTable(
	'nodes',
	{
		id: int('id').primaryKey(),
		name: text('name').notNull(),
		parentId: int('parentId').references((): AnySQLiteColumn => nodes.id, {
			onDelete: 'cascade'
		}),
		listId: int('listId').references(() => lists.id, {
			onDelete: 'cascade'
		}),
		userId: int('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(t) => ({
		unq: unique().on(t.name, t.parentId, t.userId)
	})
);

const lists = sqliteTable('lists', {
	id: int('id').primaryKey(),
	cycleDurationDays: int('cycleDurationDays').notNull().default(7),
	startDate: int('startDate', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(datetime ('now'))`),
	userId: int('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

const contacts = sqliteTable(
	'contacts',
	{
		id: int('id').primaryKey(),
		phone: text('phone').notNull(),
		name: text('name').notNull(),
		notes: text('notes').notNull().default(''),
		tags: text('tags', { mode: 'json' })
			.$type<string[]>()
			.default(sql`'[]'`),
		userId: int('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(t) => ({
		unq: unique().on(t.phone, t.userId)
	})
);

const userSchema = createSelectSchema(users);
const nodeSchema = createSelectSchema(nodes);
const listSchema = createSelectSchema(nodes);
const contactSchema = createSelectSchema(contacts, {
	tags: z.string().array().default([])
});

export {
	contactSchema,
	contacts,
	listSchema,
	lists,
	nodeSchema,
	nodes,
	userSchema,
	users,
	verificationTokens
};

declare global {
	type TNode = z.TypeOf<typeof nodeSchema>;
	type TList = z.TypeOf<typeof listSchema>;
	type TContact = z.TypeOf<typeof contactSchema>;
	type TUser = z.TypeOf<typeof userSchema>;
}
