import { DEFAULT_LOCAL_USER_ID } from '$/consts';
import { getSQLocalClient } from '$/lib/db/sqlocal.client';
import { isOnline } from '$/stores/online';
import { omitKeys } from '$/utils';
import { createFetcher } from '$/utils/zod';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { get } from '@square/svelte-store';
import { redirect } from '@sveltejs/kit';
import { contacts, lists, nodes } from 'db/schema';
import { sql } from 'drizzle-orm';
import type {
	SQLiteInsertValue,
	SQLiteTable,
	SQLiteTableWithColumns,
	TableConfig
} from 'drizzle-orm/sqlite-core';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { jwtDecode } from 'jwt-decode';
import type { TUser } from 'schema/db';
import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import { z } from 'zod';
import type { LayoutLoad } from './$types';

async function upsert<T extends TableConfig, U extends SQLiteTable<T>>(
	db: SqliteRemoteDatabase,
	table: SQLiteTableWithColumns<T>,
	values: SQLiteInsertValue<U>
) {
	const parsedValues = values.map((el) => ({
		...omitKeys(el, ['createdAt', 'updatedAt']),
		userId: DEFAULT_LOCAL_USER_ID
	}));
	const keys = Object.keys(omitKeys(parsedValues[0], ['userId']));
	const upsertCondition = Object.fromEntries(
		keys.filter((key) => key !== 'id').map((key) => [key, sql.raw(`excluded.${key}`)])
	);
	await db
		.insert(table)
		.values(parsedValues)
		.onConflictDoUpdate({ target: table.id, set: upsertCondition });
}

export const load: LayoutLoad = async (event) => {
	const token = localStorage.getItem('jwtToken');
	if (token === null) {
		if (event.route.id?.includes('(protected)')) {
			redirect(307, '/signin');
		}
		return { user: null };
	}
	const fetcher = createFetcher(event.fetch, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	const { user = null } = get(isOnline)
		? await fetcher(GetSessionResponseV1Schema, PUBLIC_API_BASE_URL + '/api/v1/get-session')
		: (jwtDecode(token) as { user: TUser });

	if (!user) {
		if (event.route.id?.includes('(protected)')) {
			redirect(307, '/signin');
		}
	} else {
		if (event.route.id?.includes('(auth)')) {
			redirect(307, '/');
		}
	}

	try {
		const response = await fetcher(
			z.object({ result: z.object({ token: z.string() }).passthrough() }),
			PUBLIC_API_BASE_URL + '/api/v1/private/sync'
		);
		const { updatedContacts, updatedNodes, updatedLists } = response.result;
		const [_, db] = await getSQLocalClient();

		if (updatedContacts.length > 0) {
			await upsert(db, contacts, updatedContacts);
		}
		if (updatedNodes.length > 0) {
			await upsert(db, nodes, updatedNodes);
		}
		if (updatedLists.length > 0) {
			await upsert(db, lists, updatedLists);
		}

		const newToken = response.result.token;
		if (newToken) localStorage.setItem('jwtToken', newToken);
	} catch (err) {
		console.error('SYNC_FAILED:', err);
	}

	return { user };
};
