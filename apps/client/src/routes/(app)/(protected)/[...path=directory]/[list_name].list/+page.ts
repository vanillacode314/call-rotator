import { DEFAULT_LOCAL_USER_ID } from '$/consts';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import * as path from '$/utils/path';
import { error } from '@sveltejs/kit';
import { getListByPath } from 'db/queries/v1/lists/by-path/index';
import type { TContact, TList } from 'schema/db';
import type { PageLoad } from './$types';

export const load = (async (event) => {
	const pwd = `${path.join('/', event.params.path, event.params.list_name + '.list')}`;
	event.depends(`list:${pwd}`);
	let list: TList | null = null;
	let contacts: TContact[] = [];
	const [rawDb, db] = await getSQLocalClient();
	const result = await getListByPath(db, DEFAULT_LOCAL_USER_ID, pwd);
	if (result === null) error(404, 'Invalid Path');
	({ list, contacts } = result);
	for (const { id } of contacts) {
		event.depends(`contact:${id}`);
	}

	return { list, contacts, pwd };
}) satisfies PageLoad;
