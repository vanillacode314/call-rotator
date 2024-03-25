import { ROOT_NODE_ID } from '$/consts';
import { isServer } from '$/consts/sveltekit';
import { query as contactsQuery } from '$/lib/db/utils/contact';
import { query as nodesQuery } from '$/lib/db/utils/nodes';
import * as path from '$/utils/path';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	const pwd = `${path.join('/', params.path, params.list_name + '.list')}`;
	if (isServer) return { pwd };

	const [node, contacts] = await Promise.all([
		nodesQuery.getNodeByPath(pwd),
		contactsQuery.getContactsById(ROOT_NODE_ID)
	]);

	depends(`list:${node.id}`);
	return { node, pwd, contacts };
}) satisfies PageLoad;
