import { nodeSchema, nodes } from '$/lib/db/schema.libsql';
import { json } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
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

	let path = result.data.path;
	path = path.trim();
	if (!path.startsWith('/'))
		return json(
			{
				success: false,
				status: 400,
				errors: [{ message: 'Path must start with /', code: 'INVALID_PATH' }]
			},
			{ status: 400 }
		);

	const parts = path.substring(1).split('/');
	const db = event.locals.db;
	let node: TNode;
	if (path === '/') {
		[node] = await db
			.select()
			.from(nodes)
			.where(and(eq(nodes.id, 0), eq(nodes.userId, event.locals.user.id)))
			.limit(1);
	} else {
		const {
			rows: [row]
		} = await db.run(sql`with recursive
									fs(n, path, id, next_part) as (
											select 1, ${path}, 0, ${parts[0]}
											union
											select
													n + 1,
													substr(substr(path, 2), instr(substr(path, 2), '/')),
													nodes.id,
													iif(
															instr(substr(path, instr(path, next_part) + length(next_part) + 1), '/')
															- 1
															= -1,
															substr(substr(path, instr(path, next_part) + length(next_part) + 1), 1),
															substr(
																	substr(path, instr(path, next_part) + length(next_part) + 1),
																	1,
																	instr(
																			substr(path, instr(path, next_part) + length(next_part) + 1),
																			'/'
																	)
																	- 1
															)
													)
											from fs, nodes
											where
													instr(path, '/') != 0 and nodes.parent_id = fs.id and next_part = nodes.name
									)
							select *
							from nodes
							where id = (select id from fs order by n desc limit 1) and nodes.name = ${parts.at(-1)} and userId = ${event.locals.user.id}`);

		if (row === undefined)
			return json(
				{ success: false, status: 404, errors: [{ message: 'Node not found', code: 'NOT_FOUND' }] },
				{ status: 404 }
			);

		node = nodeSchema
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
			.parse(row);
	}

	let children: TNode[] = [];
	if (result.data.includeChildren) {
		children = await db
			.select()
			.from(nodes)
			.where(and(eq(nodes.parent_id, node.id), eq(nodes.userId, event.locals.user.id)));
	}

	return json({
		success: true,
		status: 200,
		data: { node, children }
	});
}) satisfies RequestHandler;
