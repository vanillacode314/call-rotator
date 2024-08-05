import { db } from '$/lib/db/libsql.db';
import * as path from '$/utils/path';
import { error } from '@sveltejs/kit';
import { getNodeByPath } from 'db/queries/v1/nodes/by-path/index';
import type { TNode } from 'schema/db';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const user = event.locals.user;
	const pwd = `${path.join('/', event.params.path)}`;
	event.depends(`pwd:${pwd}`);
	let children: TNode[] | null = null;
	let node: TNode | null = null;
	const data = await getNodeByPath(db, user.id, pwd, { includeChildren: true });
	if (data !== null) {
		node = data.node;
		children = data.children;
	}
	if (children !== null && pwd !== '/') {
		children.unshift({
			id: node!.parentId!,
			name: '..',
			createdAt: new Date(),
			updatedAt: new Date(),
			deleted: false,
			parentId: null,
			listId: null,
			userId: user!.id
		});
	}

	if (children === null) error(404, 'Invalid Path');
	return { children, pwd, node };
}) satisfies PageServerLoad;
