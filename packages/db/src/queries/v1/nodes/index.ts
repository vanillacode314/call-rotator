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
			const [list] = await db.insert(lists).values({ userId: userId }).returning({ id: lists.id });
			const [_node] = await db
				.insert(nodes)
				.values({ ...node, userId, listId: list.id })
				.returning();
			return _node;
		});
	} else {
		const [_node] = await db
			.insert(nodes)
			.values({ ...node, userId })
			.returning();
		return _node;
	}
}

export { postNode };
