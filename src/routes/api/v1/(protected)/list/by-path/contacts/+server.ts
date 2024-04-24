import { GET_NODES_BY_PATH_QUERY } from '$/consts/sql';
import { nodeSchema, nodes } from '$/lib/db/schema.libsql';
import { listMetadataSchema } from '$/types/list';
import { json } from '@sveltejs/kit';
import { and, eq, inArray, sql } from 'drizzle-orm';
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

	const db = event.locals.db;

	const [row] = await db.all(
		sql.raw(GET_NODES_BY_PATH_QUERY(result.data.path, event.locals.user.id))
	);

	if (row === undefined)
		return json(
			{ success: false, status: 404, errors: [{ message: 'Node not found', code: 'NOT_FOUND' }] },
			{ status: 404 }
		);

	const node = nodeSchema
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

	const parsedMetadata = listMetadataSchema.parse(node.metadata);

	let contacts: (TContact & { nodeId: TNode['id'] })[] = [];
	const contactIds = parsedMetadata.contacts.map((contact) => contact.nodeId);
	if (contactIds.length > 0) {
		const rows = await db
			.select({ id: nodes.id, contacts: sql<string>`metadata->'contacts'` })
			.from(nodes)
			.where(
				and(
					inArray(
						nodes.id,
						parsedMetadata.contacts.map((contact) => contact.nodeId)
					),
					eq(nodes.userId, event.locals.user.id)
				)
			);
		contacts = rows.flatMap((row) => {
			const contacts = JSON.parse(row.contacts) as TContact[];
			return contacts
				.map((c) => ({ ...c, nodeId: row.id }))
				.filter((c) => parsedMetadata.contacts.some((contact) => contact.phones.includes(c.phone)));
		});
	}

	return json({
		success: true,
		status: 200,
		data: { contacts }
	});
}) satisfies RequestHandler;
