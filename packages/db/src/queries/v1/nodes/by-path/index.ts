import { sql } from 'drizzle-orm';
import { type TNode, type TUser } from 'schema/db';
import { GetNodesByPathRequestV1Schema } from 'schema/routes/api/v1/nodes/by-path';
import type { z } from 'zod';
import { GET_NODES_BY_PATH_QUERY } from '~db/consts/sql';
import { Database } from '~db/types';

async function getNodeByPath(
	db: Database,
	userId: TUser['id'],
	path: string,
	{ includeChildren }: z.TypeOf<typeof GetNodesByPathRequestV1Schema>
): Promise<{ node: TNode; children: TNode[] } | null> {
	if (!path.startsWith('/')) return null;
	const rows = (await db.all(
		sql.raw(GET_NODES_BY_PATH_QUERY(path, userId, includeChildren))
	)) as any[][];
	if (rows[0] === undefined) return null;
	const { columns } = (await db.run(sql`SELECT
  *
FROM
  nodes
WHERE
  1 = 2`)) as { columns: string[] };
	const mappedRows = rows.map((row) => {
		return row.reduce((acc, cur, i) => {
			acc[columns[i]] = cur;
			return acc;
		}, {} as TNode);
	});
	const node = mappedRows.shift()!;
	return { node, children: mappedRows };
}

export { getNodeByPath };
