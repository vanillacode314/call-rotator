import { sql } from 'drizzle-orm';
import type { z } from 'zod';
import { DEFAULT_LOCAL_USER_ID, ROOT_NODE_ID } from '~db/consts';
import { GET_NODES_BY_PATH_QUERY } from '~db/consts/sql';
import { Database } from '~db/types';
import { getNodeById } from '../by-id';
import { getInputSchema } from './schema';

async function getNodeByPath(
	db: Database,
	inputs: z.TypeOf<typeof getInputSchema>
): Promise<{ node: TNode; children: TNode[] } | null> {
	const { path, includeChildren } = getInputSchema.parse(inputs);
	if (!path.startsWith('/')) return null;
	if (path === '/') return getNodeById(db, { id: ROOT_NODE_ID, includeChildren });
	const rows = (await db.all(
		sql.raw(GET_NODES_BY_PATH_QUERY(path, DEFAULT_LOCAL_USER_ID, includeChildren))
	)) as TNode[];
	if (rows[0] === undefined) return null;
	const node = rows.shift()!;
	return { node, children: rows };
}

export { getNodeByPath };
