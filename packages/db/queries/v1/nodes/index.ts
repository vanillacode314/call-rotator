import type { z } from 'zod';
import { DEFAULT_LOCAL_USER_ID } from '~db/consts';
import { lists, nodes } from '~db/schema';
import { Database } from '~db/types';
import { postInputSchema } from './schema';

async function postNode(db: Database, inputs: z.TypeOf<typeof postInputSchema>): Promise<TNode> {
	const { node } = postInputSchema.parse(inputs);
	if (node.name.endsWith('.list')) {
		return db.transaction(async () => {
			const [list] = await db
				.insert(lists)
				.values({ userId: DEFAULT_LOCAL_USER_ID })
				.returning({ id: lists.id });
			const [_node] = await db
				.insert(nodes)
				.values({ ...node, userId: DEFAULT_LOCAL_USER_ID, listId: list.id })
				.returning();
			return _node;
		});
	} else {
		const [_node] = await db
			.insert(nodes)
			.values({ ...node, userId: DEFAULT_LOCAL_USER_ID })
			.returning();
		return _node;
	}
}

export { postNode };
