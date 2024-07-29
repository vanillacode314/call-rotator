import { sql } from 'drizzle-orm';
import {
	int,
	primaryKey,
	sqliteTable,
	text,
	unique,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';

const users = sqliteTable('users', {
	id: int('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	password: text('password').notNull(),
	emailVerified: int('emailVerified', { mode: 'timestamp_ms' }),
	createdAt: int('createdAt', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: int('updatedAt', { mode: 'timestamp_ms' })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
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
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: int('createdAt', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: int('updatedAt', { mode: 'timestamp_ms' })
			.default(sql`(CURRENT_TIMESTAMP)`)
			.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
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
		.default(sql`(CURRENT_TIMESTAMP)`),
	userId: int('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: int('createdAt', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: int('updatedAt', { mode: 'timestamp_ms' })
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
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
			.notNull()
			.default(sql`'[]'`),
		userId: int('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: int('createdAt', { mode: 'timestamp_ms' }).default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: int('updatedAt', { mode: 'timestamp_ms' })
			.default(sql`(CURRENT_TIMESTAMP)`)
			.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
	},
	(t) => ({
		unq: unique().on(t.phone, t.userId)
	})
);

const listContactAssociation = sqliteTable(
	'list_contact',
	{
		listId: int('listId')
			.references(() => lists.id, { onDelete: 'cascade' })
			.notNull(),
		contactId: int('contactId')
			.references(() => contacts.id, { onDelete: 'cascade' })
			.notNull()
	},
	(t) => ({
		pk: primaryKey({ columns: [t.listId, t.contactId] })
	})
);

export { contacts, listContactAssociation, lists, nodes, users, verificationTokens };
