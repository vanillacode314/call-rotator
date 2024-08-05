import { sql } from 'drizzle-orm';
import { TContact, TNode, type TList, type TUser } from 'schema/db';
import { GET_NODES_BY_PATH_QUERY } from '~db/consts/sql';
import { Database } from '~db/types';
import { getListById } from '../by-id';

async function getListByPath(
	db: Database,
	userId: TUser['id'],
	path: string
): Promise<{ list: TList; contacts: TContact[] } | null> {
	if (!path.startsWith('/')) return null;
	const rows = (await db.all(sql.raw(GET_NODES_BY_PATH_QUERY(path, userId, false)))) as TNode[];
	if (rows[0] === undefined) return null;
	const node = rows.shift()!;
	if (!node.listId) return null;
	return await getListById(db, userId, node.listId);
}

export { getListByPath };
