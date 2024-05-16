import { eq, or } from 'drizzle-orm';
import type { z } from 'zod';
import { nodes } from '~db/schema';
import { Database } from '~db/types';
import { deleteInputSchema, getInputSchema, putInputSchema } from './schema';

async function getNodeById(db: Database, inputs: z.TypeOf<typeof getInputSchema>) {
	const { id, includeChildren } = getInputSchema.parse(inputs);
	if (includeChildren) {
		const rows = await db
			.select()
			.from(nodes)
			.where(or(eq(nodes.id, id), eq(nodes.parentId, id)));
		if (rows[0] === undefined) return null;
		const node = rows.shift()!;
		return { node, children: rows };
	} else {
		const [node] = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);
		return node ? { node, children: [] } : null;
	}
}

async function putNode(db: Database, inputs: z.TypeOf<typeof putInputSchema>) {
	const { node } = putInputSchema.parse(inputs);
	const [_node] = await db.update(nodes).set(node).where(eq(nodes.id, node.id)).returning();
	return _node;
}

async function deleteNode(db: Database, inputs: z.TypeOf<typeof deleteInputSchema>) {
	const { id } = deleteInputSchema.parse(inputs);
	const [_node] = await db.delete(nodes).where(eq(nodes.id, id)).returning();
	return _node;
}

export { deleteNode, getNodeById, putNode };
