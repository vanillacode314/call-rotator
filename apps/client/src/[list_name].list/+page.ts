import { isServer } from '$/consts/sveltekit';
import * as path from '$/utils/path';
import { parseMetadata } from '$/utils/types';
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
	}

	if (node === null) error(404, 'Invalid Path');
	return { list, contacts };
}) satisfies PageLoad;
