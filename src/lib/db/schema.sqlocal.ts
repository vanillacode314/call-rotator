import { int, sqliteTable, text, unique, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const nodes = sqliteTable(
	'nodes',
	{
		id: int('id').primaryKey(),
		name: text('name').notNull(),
		parent_id: int('parent_id').references((): AnySQLiteColumn => nodes.id),
		metadata: text('metadata', { mode: 'json' })
			.$type<Record<string, unknown> | null>()
			.default(null)
	},
	(t) => ({
		unq: unique().on(t.name, t.parent_id)
	})
);

const nodeSchema = createSelectSchema(nodes, {
	metadata: z.record(z.string(), z.unknown()).nullable()
});

declare global {
	type TNode = z.infer<typeof nodeSchema>;
}
export { nodeSchema, nodes };
