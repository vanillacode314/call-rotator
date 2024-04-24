import {
	integer,
	primaryKey,
	sqliteTable,
	text,
	unique,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const users = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	password: text('password').notNull(),
	emailVerified: integer('emailVerified', { mode: 'timestamp_ms' })
	// image: text('image')
});

// const sessions = sqliteTable('session', {
// 	token: text('token').notNull().primaryKey(),
// 	userId: integer('userId')
// 		.notNull()
// 		.references(() => users.id, { onDelete: 'cascade' }),
// 	expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
// });

const verificationTokens = sqliteTable(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
	})
);

const nodes = sqliteTable(
	'nodes',
	{
		id: integer('id').primaryKey(),
		name: text('name').notNull(),
		parent_id: integer('parent_id').references((): AnySQLiteColumn => nodes.id, {
			onDelete: 'cascade'
		}),
		metadata: text('metadata', { mode: 'json' })
			.$type<Record<string, unknown> | null>()
			.default(null),
		userId: integer('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(t) => ({
		unq: unique().on(t.name, t.parent_id, t.userId)
	})
);

const userSchema = createSelectSchema(users);
const nodeSchema = createSelectSchema(nodes, {
	metadata: z.record(z.string(), z.unknown()).nullable()
});

export { nodeSchema, nodes, userSchema, users, verificationTokens };

declare global {
	type TUser = z.TypeOf<typeof userSchema>;
}
