import { query } from '$/lib/db/utils/nodes';
import { getOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-path/schema';
import { contactMetadataSchema } from '$/types/contact';
import * as path from '$/utils/path';
import { parseMetadata } from '$/utils/types';
import { createFetcher } from '$/utils/zod';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent, fetch, params, depends }) => {
	const { mode } = await parent();
	const pwd = `${path.join('/', params.path, params.contact_name + '.contacts')}`;

	let node: TNode | null = null;
	if (mode === 'offline') {
		node = await query.getNodeByPath(pwd);
		if (node === null) error(404, 'Invalid Path');
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
		({ node } = result.data);
		if (node === null) error(404, 'Invalid Path');
	}
	node = parseMetadata(node, contactMetadataSchema);

	depends(`contact:${node.id}`);

	return { node, pwd };
}) satisfies PageLoad;
