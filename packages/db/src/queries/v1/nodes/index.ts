import { eq } from 'drizzle-orm';
import { type TNode, type TUser } from 'schema/db';
import { PostNodeRequestV1Schema } from 'schema/routes/api/v1/nodes/index';
import type { z } from 'zod';
import { lists, nodes } from '~db/schema';
import { Database } from '~db/types';

async function postNode(
	db: Database,
	userId: TUser['id'],
	{ node }: z.TypeOf<typeof PostNodeRequestV1Schema>
): Promise<TNode> {
	if (node.name.endsWith('.list')) {
		return db.transaction(async () => {
			const [_node] = await db
				.insert(nodes)
				.values({ ...node, userId })
				.onConflictDoUpdate({
					target: [nodes.name, nodes.userId, nodes.parentId],
					set: { deleted: false, createdAt: new Date() }
				})
				.returning();
			if (_node.listId === null) {
				const [list] = await db.insert(lists).values({ userId: userId }).returning({id: lists.id});
				await db.update(nodes).set({ listId: list.id}).where(eq(nodes.id, _node.id));
			} else {
				await db
					.update(lists)
					.set({ deleted: false, createdAt: new Date() })
					.where(eq(lists.id, _node.listId));
			}
			return _node;
		});
	} else {
		const [_node] = await db
			.insert(nodes)
			.values({ ...node, userId })
			.onConflictDoUpdate({
				target: [nodes.name, nodes.userId, nodes.parentId],
				set: { deleted: false, createdAt: new Date() }
			})
			.returning();
		return _node;
	}
}

export { postNode };
