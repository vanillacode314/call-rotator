import { isServer } from '$/consts/sveltekit';
import { query as contactsQuery } from '$/lib/db/utils/contact';
import { query as nodesQuery } from '$/lib/db/utils/nodes';
import { listMetadataSchema } from '$/types/list';
import * as path from '$/utils/path';
import { parseMetadata } from '$/utils/types';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	const pwd = `${path.join('/', params.path, params.list_name + '.list')}`;
	if (isServer) return { pwd };

	const node = parseMetadata(await nodesQuery.getNodeByPath(pwd), listMetadataSchema);
	const contacts = await contactsQuery.getContactsByIdsAndPhone(node.metadata.contacts);

	depends(`list:${node.id}`);
	for (const { nodeId } of Object.values(contacts)) {
		depends(`contact:${nodeId}`);
	}
	return { node, pwd, contacts };
}) satisfies PageLoad;
