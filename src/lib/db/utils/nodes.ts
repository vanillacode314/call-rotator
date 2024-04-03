import { isServer } from '$/consts/sveltekit';
import { nodes } from '$/lib/db/schema';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import { $mode } from '$/stores';
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

export const query = {
	async getNodeById(id: number) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot getNode on server in offlineMode');

				const db = await getSQLocalClient();
				const [node] = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);

				return node;
			case 'online':
				throw new Error('todo');
		}
	},
	async getNodesByIds(ids: TNode['id'][]) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot getNode on server in offlineMode');

				const db = await getSQLocalClient();
				const _nodes = await db.select().from(nodes).where(inArray(nodes.id, ids));

				return _nodes;
			case 'online':
				throw new Error('todo');
		}
	},
	async getNodeByPath(path: string) {
		path = path.trim();
		if (!path.startsWith('/')) throw new Error('Invalid Path');
		if (path === '/') {
			return this.getNodeById(0);
		}
		const parts = path.substring(1).split('/');
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot getChildren on server in offlineMode');

				const db = await getSQLocalClient();
				let currentId: number = 0;
				let node: TNode | null = null;
				for (const part of parts) {
					[node] = await db
						.select()
						.from(nodes)
						.where(and(eq(nodes.parent_id, currentId), eq(nodes.name, part)))
						.limit(1);
					if (!node) throw new Error('Invalid Path');
					currentId = node.id;
				}

				return node!;
			case 'online':
				throw new Error('todo');
		}
	},
	async getChildrenById(
		parentId?: number,
		{
			pattern = '',
			returns = 'both'
		}: Partial<{ pattern: string; returns: 'dir' | 'files' | 'both' }> = {}
	) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot getChildren on server in offlineMode');

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
			case 'online':
				throw new Error('todo');
		}
	},
	async getChildrenByPath(
		path: string,
		{
			pattern = '',
			returns = 'both'
		}: Partial<{ pattern: string; returns: 'dir' | 'files' | 'both' }> = {}
	) {
		const node = await this.getNodeByPath(path);
		return this.getChildrenById(node.id, { pattern, returns });
	}
};

export const mutations = {
	async createNode(node: Omit<TNode, 'id'>) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot createNode on server in offlineMode');

				const db = await getSQLocalClient();
				const [_node] = await db.insert(nodes).values(node).returning();

				return _node;
			case 'online':
				throw new Error('todo');
		}
	},
	async renameNode(id: number, name: string) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot renameNode on server in offlineMode');

				const db = await getSQLocalClient();
				await db.update(nodes).set({ name }).where(eq(nodes.id, id));

				return;
			case 'online':
				throw new Error('todo');
		}
	},
	async moveNode(id: number, parentId?: number) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot moveNode on server in offlineMode');

				const db = await getSQLocalClient();
				await db.update(nodes).set({ parent_id: parentId }).where(eq(nodes.id, id));

				return;
			case 'online':
				throw new Error('todo');
		}
	},
	async copyNode(id: number, parentId?: number, tx?: TTransaction) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot copyNode on server in offlineMode');

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
			case 'online':
				throw new Error('todo');
		}
	},
	async removeNode(id: number, tx?: TTransaction) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot removeNode on server in offlineMode');

				const children = await query.getChildrenById(id);

				if (tx) {
					await Promise.all(children.map((child) => this.removeNode(child.id, tx)));
					await tx.delete(nodes).where(eq(nodes.id, id));
				} else {
					const db = await getSQLocalClient();
					await db.transaction(async (tx) => {
						await Promise.all(children.map((child) => this.removeNode(child.id, tx)));
						await tx.delete(nodes).where(eq(nodes.id, id));
					});
				}

				return;
			case 'online':
				throw new Error('todo');
		}
	},
	async writeMetadata(id: number, metadata: Record<string, unknown>) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot writeMetadata on server in offlineMode');

				const db = await getSQLocalClient();
				await db.update(nodes).set({ metadata }).where(eq(nodes.id, id));

				return;
			case 'online':
				throw new Error('todo');
		}
	},
	async updateMetadata(id: number, updateFn: (metadata: TNode['metadata']) => TNode['metadata']) {
		switch ($mode) {
			case 'offline':
				if (isServer) throw new Error('Cannot updateMetadata on server in offlineMode');

				const db = await getSQLocalClient();
				const node = await query.getNodeById(id);
				await db
					.update(nodes)
					.set({ metadata: updateFn(node.metadata) })
					.where(eq(nodes.id, id));

				return;
			case 'online':
				throw new Error('todo');
		}
	}
};

type TTransaction = SQLiteTransaction<
	'async',
	SqliteRemoteResult<unknown>,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>;
