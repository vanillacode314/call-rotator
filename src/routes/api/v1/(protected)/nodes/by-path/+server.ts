import { GET_NODES_BY_PATH_QUERY } from '$/consts/sql';
import { nodeSchema, nodes } from '$/lib/db/schema.libsql';
import { json } from '@sveltejs/kit';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { getInputSchema } from './schema';

export const GET = (async (event) => {
	const result = getInputSchema.safeParse(Object.fromEntries(event.url.searchParams.entries()));
	if (!result.success) {
		return json(
			{
				success: false,
				status: 400,
				errors: result.error.errors.map((e) => ({ message: e.message, code: 'INVALID_QUERY' }))
			},
			{ status: 400 }
		);
	}

	if (!result.data.path.startsWith('/'))
		return json(
			{
				success: false,
				status: 400,
				errors: [{ message: 'Path must start with /', code: 'INVALID_PATH' }]
			},
			{ status: 400 }
		);
	const path = result.data.path.trim();
	const db = event.locals.db;
	let rows: TNode[];
	if (path === '/') {
		if (result.data.includeChildren) {
			rows = await db
				.select()
				.from(nodes)
				.where(
					and(
						or(isNull(nodes.parent_id), eq(nodes.parent_id, 0)),
						eq(nodes.userId, event.locals.user.id)
					)
				);
		} else {
			rows = await db
				.select()
				.from(nodes)
				.where(and(isNull(nodes.parent_id), eq(nodes.userId, event.locals.user.id)));
		}
	} else {
		rows = await db.all(
			sql.raw(GET_NODES_BY_PATH_QUERY(path, event.locals.user.id, result.data.includeChildren))
		);
	}

	if (rows === undefined || rows.length === 0)
		return json(
			{ success: false, status: 404, errors: [{ message: 'Node not found', code: 'NOT_FOUND' }] },
			{ status: 404 }
		);

	rows = nodeSchema
		.extend({
			metadata: z
				.string()
				.or(z.record(z.string(), z.string()))
				.nullable()
				.transform((value) => {
					return (
						value === null ? null : typeof value === 'string' ? JSON.parse(value) : value
					) as TNode['metadata'];
				})
		})
		.array()
		.parse(rows);

	const node = rows.shift();

	return json({
		success: true,
		status: 200,
		data: { node, children: rows }
	});
}) satisfies RequestHandler;
