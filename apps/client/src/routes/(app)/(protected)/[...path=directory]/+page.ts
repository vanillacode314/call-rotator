import { isServer } from '$/consts/sveltekit';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import * as path from '$/utils/path';
import { error } from '@sveltejs/kit';
import { getNodeByPath } from 'db/queries/v1/nodes/by-path/index';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params, depends, fetch }) => {
	const { user } = await parent();
	const pwd = `${path.join('/', params.path)}`;
	depends(`pwd:${pwd}`);
	let children: TNode[] | null = null;
	let node: TNode | null = null;
	const db = await getSQLocalClient();
	const data = isServer ? null : await getNodeByPath(db, user!.id, pwd, { includeChildren: true });
	if (data !== null) {
		node = data.node;
		children = data.children;
	}
	if (children !== null && pwd !== '/') {
		children.unshift({
			id: node!.parentId!,
			name: '..',
			parentId: null,
			listId: null,
			userId: user!.id
		});
	}

	if (children === null && !isServer) error(404, 'Invalid Path');
	return { children, pwd, node };
}) satisfies PageLoad;
