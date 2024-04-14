import { isServer } from '$/consts/sveltekit';
import { query as contactsQuery } from '$/lib/db/utils/contact';
import { query as nodesQuery } from '$/lib/db/utils/nodes';
import { getOutputSchema as listContactsGetOutputSchema } from '$/routes/api/v1/(protected)/list/[id]/contacts/schema';
import { getOutputSchema as nodesGetOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-path/schema';
import { listMetadataSchema } from '$/types/list';
import * as path from '$/utils/path';
import { parseMetadata } from '$/utils/types';
import { createFetcher } from '$/utils/zod';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params, depends, fetch }) => {
	const { mode } = await parent();
	const pwd = `${path.join('/', params.path, params.list_name + '.list')}`;
	if (isServer) return { pwd };

	let node: TNode | null = null;
	let contacts: (TContact & { nodeId: TNode['id'] })[] = [];
	if (mode === 'offline') {
		const node = await nodesQuery.getNodeByPath(pwd);
		const parsedNode = parseMetadata(node, listMetadataSchema);
		contacts = await contactsQuery.getContactsByIdsAndPhone(parsedNode.metadata.contacts);
	} else {
		const fetcher = createFetcher(fetch);
		const searchParams = new URLSearchParams();
		searchParams.set('path', pwd);
		searchParams.set('includeChildren', 'true');
		const result = await fetcher(
			nodesGetOutputSchema,
			'/api/v1/nodes/by-path?' + searchParams.toString()
		);
		if (!result.success) {
			error(result.status, result.errors.map((e) => e.message).join('\n'));
		}
		({ node } = result.data);
		const parsedNode = parseMetadata(node, listMetadataSchema);
		const result2 = await fetcher(listContactsGetOutputSchema, `/api/v1/list/${node.id}/contacts`);
		if (!result2.success) {
			error(result2.status, result2.errors.map((e) => e.message).join('\n'));
		}
		contacts = result2.data.contacts;
	}

	if (node === null) error(404, 'Invalid Path');
	depends(`list:${node.id}`);
	for (const { nodeId } of contacts) {
		depends(`contact:${nodeId}`);
	}
	return { node, pwd, contacts };
}) satisfies PageLoad;
