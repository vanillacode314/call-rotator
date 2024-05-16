import { DEFAULT_LOCAL_USER_ID, ROOT_NODE_ID } from '$/consts';
import { GET_NODES_BY_PATH_QUERY } from '$/consts/sql';
import { getRawSQLocalClient } from '$/lib/db/sqlocal.client';
import type { z } from 'zod';
import { getNodeById } from '../by-id/local';
import { getInputSchema } from './schema';

async function getNodeByPath(
	inputs: z.TypeOf<typeof getInputSchema>
): Promise<{ node: TNode; children: TNode[] } | null> {
	const { path, includeChildren } = getInputSchema.parse(inputs);
	if (!path.startsWith('/')) return null;
	if (path === '/') return getNodeById({ id: ROOT_NODE_ID, includeChildren });
	const dbx = await getRawSQLocalClient();
	// @ts-ignore: it works
	const rows = (await dbx.sql([
		GET_NODES_BY_PATH_QUERY(path, DEFAULT_LOCAL_USER_ID, includeChildren)
	])) as TNode[];
	if (rows[0] === undefined) return null;
	const node = rows.shift()!;
	return { node, children: rows };
}

export { getNodeByPath };
