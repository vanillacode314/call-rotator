import { isServer } from '$/consts/sveltekit';
import { query } from '$/lib/db/utils/nodes';
import { contactMetadataSchema } from '$/types/contact';
import * as path from '$/utils/path';
import { parseMetadata } from '$/utils/types';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	const pwd = `${path.join('/', params.path, params.contact_name + '.contacts')}`;
	if (isServer) return { pwd };

	const node = await query
		.getNodeByPath(pwd)
		.then((node) => parseMetadata(node, contactMetadataSchema));
	depends(`contact:${node.id}`);
	return { node, pwd };
}) satisfies PageLoad;
