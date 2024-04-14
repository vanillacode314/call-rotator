import { nodeSchema, nodes } from '$/lib/db/schema.sqlocal';
import { getRawSQLocalClient, getSQLocalClient } from '$/lib/db/sqlocal.client';
import {
	and,
	eq,
	inArray,
	isNotNull,
	isNull,
	like,
	type ExtractTablesWithRelations
} from 'drizzle-orm';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import type { SqliteRemoteResult } from 'drizzle-orm/sqlite-proxy';
import { z } from 'zod';

export const query = {
	async getNodeById(id: number) {
		const db = await getSQLocalClient();
		const [node] = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);
		return node;
	},
	async getNodesByIds(ids: TNode['id'][]) {
		const db = await getSQLocalClient();
		const _nodes = await db.select().from(nodes).where(inArray(nodes.id, ids));

		return _nodes;
	},
	async getNodeByPath(path: string): Promise<TNode | null> {
		path = path.trim();
		if (!path.startsWith('/')) return null;
		if (path === '/') return this.getNodeById(0);
		const parts = path.substring(1).split('/');
		const dbx = await getRawSQLocalClient();
		const [row] = await dbx.sql`with recursive
									fs(n, path, id, next_part) as (
											select 1, ${path}, 0, ${parts[0]}
											union
											select
													n + 1,
													substr(substr(path, 2), instr(substr(path, 2), '/')),
													nodes.id,
													iif(
															instr(substr(path, instr(path, next_part) + length(next_part) + 1), '/')
															- 1
															= -1,
															substr(substr(path, instr(path, next_part) + length(next_part) + 1), 1),
															substr(
																	substr(path, instr(path, next_part) + length(next_part) + 1),
																	1,
																	instr(
																			substr(path, instr(path, next_part) + length(next_part) + 1),
																			'/'
																	)
																	- 1
															)
													)
											from fs, nodes
											where
													instr(path, '/') != 0 and nodes.parent_id = fs.id and next_part = nodes.name
									)
							select *
							from nodes
							where id = (select id from fs order by n desc limit 1) and nodes.name = ${parts.at(-1)}`;

		if (row === undefined) return null;
		return nodeSchema
			.extend({
				metadata: z
					.string()
					.nullable()
					.transform((value) => {
						return (value === null ? null : JSON.parse(value)) as TNode['metadata'];
					})
			})
			.parse(row);
	},
	async getChildrenById(
		parentId?: number,
		{
			pattern = '',
			returns = 'both'
		}: Partial<{ pattern: string; returns: 'dir' | 'files' | 'both' }> = {}
	) {
		const db = await getSQLocalClient();
		const children = await db
			.select()
			.from(nodes)
			.where(
				and(
					parentId !== undefined ? eq(nodes.parent_id, parentId) : isNull(nodes.parent_id),
					pattern !== '' ? like(nodes.name, pattern) : undefined,
					returns === 'files'
						? isNotNull(nodes.metadata)
						: returns === 'dir'
							? isNull(nodes.metadata)
							: undefined
				)
			);

		return children ?? [];
	},
	async getChildrenByPath(
		path: string,
		{
			pattern = '',
			returns = 'both'
		}: Partial<{ pattern: string; returns: 'dir' | 'files' | 'both' }> = {}
	): Promise<[TNode | null, TNode[] | null]> {
		const node = await this.getNodeByPath(path);
		if (node === null) return [node, null];
		return [node, await this.getChildrenById(node.id, { pattern, returns })];
	}
};

export const mutations = {
	async createNode(node: Omit<TNode, 'id'>) {
		const db = await getSQLocalClient();
		const [_node] = await db.insert(nodes).values(node).returning();

		return _node;
	},
	async renameNode(id: number, name: string) {
		const db = await getSQLocalClient();
		await db.update(nodes).set({ name }).where(eq(nodes.id, id));
		return;
	},
	async moveNode(id: number, parentId?: number) {
		const db = await getSQLocalClient();
		await db.update(nodes).set({ parent_id: parentId }).where(eq(nodes.id, id));

		return;
	},
	async copyNode(id: number, parentId?: number, tx?: TTransaction) {
		const node = await query.getNodeById(id);
		if (!node) throw new Error('Invalid Node');
		const children = await query.getChildrenById(id);

		let newNode: TNode;
		if (tx) {
			[newNode] = await tx
				.insert(nodes)
				.values({ ...node, id: undefined, parent_id: parentId })
				.returning();
			await Promise.all(children.map((child) => this.copyNode(child.id, newNode.id, tx)));
		} else {
			const db = await getSQLocalClient();
			newNode = await db.transaction(async (tx) => {
				const [newNode] = await db
					.insert(nodes)
					.values({ ...node, id: undefined, parent_id: parentId })
					.returning();
				await Promise.all(children.map((child) => this.copyNode(child.id, newNode.id, tx)));
				return newNode;
			});
		}

		return newNode;
	},
	async removeNode(id: number) {
		const db = await getSQLocalClient();
		await db.delete(nodes).where(eq(nodes.id, id));
		return;
	},
	async writeMetadata(id: number, metadata: Record<string, unknown>) {
		const db = await getSQLocalClient();
		await db.update(nodes).set({ metadata }).where(eq(nodes.id, id));
		return;
	},
	async updateMetadata(id: number, updateFn: (metadata: TNode['metadata']) => TNode['metadata']) {
		const db = await getSQLocalClient();
		const node = await query.getNodeById(id);
		await db
			.update(nodes)
			.set({ metadata: updateFn(node.metadata) })
			.where(eq(nodes.id, id));
		return;
	}
};

declare global {
	type TTransaction = SQLiteTransaction<
		'async',
		SqliteRemoteResult<unknown>,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>;
}
