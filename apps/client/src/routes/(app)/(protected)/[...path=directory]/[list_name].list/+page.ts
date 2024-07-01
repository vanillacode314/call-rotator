import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import * as path from '$/utils/path';
import { error } from '@sveltejs/kit';
import { getListByPath } from 'db/queries/v1/lists/by-path/index';
import type { TContact, TList } from 'schema/db';
import type { PageLoad } from './$types';

export const load = (async (event) => {
	const pwd = `${path.join('/', event.params.path, event.params.list_name + '.list')}`;
	event.depends(`list:${pwd}`);
	const { user } = await event.parent();

	let list: TList | null = null;
	let contacts: TContact[] = [];
	const db = await getSQLocalClient();
	const result = await getListByPath(db, user!.id, pwd);
	if (result === null) error(404, 'Invalid Path');
	({ list, contacts } = result);

	return { list, contacts, pwd };
}) satisfies PageLoad;
