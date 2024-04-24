import { nodes } from '$/lib/db/schema.libsql';
import { listMetadataSchema } from '$/types/list';
import { json } from '@sveltejs/kit';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getInputSchema } from './schema';

export const GET = (async (event) => {
	const result = getInputSchema.safeParse(event.params);
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

	const id = result.data.id;

	const db = event.locals.db;
	const [node] = await db
		.select()
		.from(nodes)
		.where(and(eq(nodes.id, id), eq(nodes.userId, event.locals.user.id)))
		.limit(1);

	if (node === undefined)
		return json(
			{ success: false, status: 404, errors: [{ message: 'Node not found', code: 'NOT_FOUND' }] },
			{ status: 404 }
		);

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
