import * as path from '$/utils/path';
import { createFetcher } from '$/utils/zod';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { TNode } from 'schema/db';
import { GetNodesByPathResponseV1Schema } from 'schema/routes/api/v1/nodes/by-path';
import type { PageLoad } from './$types';

export const load = (async (event) => {
	const { user } = await event.parent();
	const pwd = `${path.join('/', event.params.path)}`;
	event.depends(`pwd:${pwd}`);
	let children: TNode[] | null = null;
	let node: TNode | null = null;
	const fetcher = createFetcher(event.fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});
	const searchParams = new URLSearchParams({ path: pwd, includeChildren: 'true' });
	const { result, success, status } = await fetcher(
		GetNodesByPathResponseV1Schema,
		`${PUBLIC_API_BASE_URL}/api/v1/private/nodes/by-path?${searchParams.toString()}`
	);
	if (!success) error(status, result.issues.join(';'));
	({ node, children } = result);
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
}) satisfies PageLoad;
