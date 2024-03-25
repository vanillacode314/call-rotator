import { isServer } from '$/consts/sveltekit';
import { query } from '$/lib/db/utils/nodes';
import * as path from '$/utils/path';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	const pwd = `${path.join('/', params.path)}`;
	depends(`pwd:${pwd}`);
	const children = isServer ? null : await query.getChildrenByPath(pwd);

	return { children, pwd };
}) satisfies PageLoad;
