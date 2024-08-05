import { db } from '$/lib/db/libsql.db';
import * as path from '$/utils/path';
import { error } from '@sveltejs/kit';
import { getListByPath } from 'db/queries/v1/lists/by-path/index';
import type { TContact, TList } from 'schema/db';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const user = event.locals.user;
	const pwd = `${path.join('/', event.params.path, event.params.list_name + '.list')}`;
	event.depends(`list:${pwd}`);
	let list: TList | null = null;
	let contacts: TContact[] = [];
	const result = await getListByPath(db, user.id, pwd);
	if (result === null) error(404, 'Invalid Path');
	({ list, contacts } = result);
	for (const { id } of contacts) {
		event.depends(`contact:${id}`);
	}

	return { list, contacts, pwd };
}) satisfies PageServerLoad;
