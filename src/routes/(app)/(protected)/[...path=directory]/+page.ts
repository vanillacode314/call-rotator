import { isServer } from '$/consts/sveltekit';
import { query } from '$/lib/db/utils/nodes';
import { getOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-path/schema';
import * as path from '$/utils/path';
import { createFetcher } from '$/utils/zod';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params, depends, fetch }) => {
	const { mode } = await parent();
	const pwd = `${path.join('/', params.path)}`;
	depends(`pwd:${pwd}`);
	let children: TNode[] | null = null;
	let node: TNode | null = null;
	if (mode === 'offline') {
		[node, children] = isServer ? [null, null] : await query.getChildrenByPath(pwd);
		if (children !== null && pwd !== '/') {
			children.unshift({
				id: node!.parent_id!,
				name: '..',
				parent_id: null,
				metadata: null
			});
		}
	} else {
		const fetcher = createFetcher(fetch);
		const searchParams = new URLSearchParams();
		searchParams.set('path', pwd);
		searchParams.set('includeChildren', 'true');
		const result = await fetcher(
			getOutputSchema,
			'/api/v1/nodes/by-path?' + searchParams.toString()
		);
		if (!result.success) {
			error(result.status, result.errors.map((e) => e.message).join('\n'));
		}
		({ children, node } = result.data);
		if (pwd !== '/') {
			children.unshift({
				id: result.data.node.parent_id!,
				name: '..',
				parent_id: null,
				metadata: null
			});
		}
	}

	if (children === null && !isServer) error(404, 'Invalid Path');
	return { children, pwd, node };
}) satisfies PageLoad;
