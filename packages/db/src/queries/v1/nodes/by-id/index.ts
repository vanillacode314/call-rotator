import { and, eq, or } from 'drizzle-orm';
import { type TNode, type TUser } from 'schema/db';
import {
	GetNodeByIdRequestV1Schema,
	PutNodeByIdRequestV1Schema
} from 'schema/routes/api/v1/nodes/by-id';
import type { z } from 'zod';
import { listContactAssociation, lists, nodes } from '~db/schema';
import { Database } from '~db/types';

async function getNodeById(
	db: Database,
	userId: TUser['id'],
	id: TNode['id'],
	{ includeChildren }: z.TypeOf<typeof GetNodeByIdRequestV1Schema>
) {
	if (includeChildren) {
		const rows = await db
			.select()
			.from(nodes)
			.where(
				and(
					or(eq(nodes.id, id), eq(nodes.parentId, id)),
					eq(nodes.userId, userId),
					eq(nodes.deleted, false)
				)
			);
		if (rows[0] === undefined) return null;
		const node = rows.shift()!;
		return { node, children: rows };
	} else {
		const [node] = await db
			.select()
			.from(nodes)
			.where(and(eq(nodes.id, id), eq(nodes.userId, userId), eq(nodes.deleted, false)))
			.limit(1);
		return node ? { node, children: [] } : null;
	}
}
async function putNode(
	db: Database,
	userId: TUser['id'],
	id: TNode['id'],
	{ node }: z.TypeOf<typeof PutNodeByIdRequestV1Schema>
) {
	const [_node] = await db
		.update(nodes)
		.set(node)
		.where(and(eq(nodes.id, id), eq(nodes.userId, userId)))
		.returning();
	return _node;
}

async function deleteNode(db: Database, userId: TUser['id'], id: TNode['id']) {
	return db.transaction(async (tx) => {
		const [_node] = await db
			.update(nodes)
			.set({ deleted: true })
			.where(and(eq(nodes.userId, userId), eq(nodes.id, id)))
			.returning();
		if (_node.listId === null) return _node;

		await db.update(lists).set({ deleted: true }).where(eq(lists.id, _node.listId));
		await db
			.update(listContactAssociation)
			.set({ deleted: true })
			.where(eq(listContactAssociation.listId, _node.listId));

		return _node;
	});
}

export { deleteNode, getNodeById, putNode };
