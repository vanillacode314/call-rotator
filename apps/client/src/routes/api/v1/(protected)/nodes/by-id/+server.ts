import { json } from '@sveltejs/kit';
import { nodes } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { deleteInputSchema, getInputSchema, putInputSchema } from './schema';

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
		data: {
			node,
			children
		}
	});
}) satisfies RequestHandler;

export const PUT = (async (event) => {
	const result = putInputSchema.safeParse(Object.fromEntries(await event.request.formData()));
	if (!result.success) {
		return json(
			{
				success: false,
				status: 400,
				errors: result.error.errors.map((e) => ({ message: e.message, code: 'INVALID_FORMDATA' }))
			},
			{ status: 400 }
		);
	}

	const { node } = result.data;
	if (node.parent_id === null) {
		return json(
			{
				success: false,
				status: 400,
				errors: [{ message: 'Invalid Parent', code: 'INVALID_FORMDATA' }]
			},
			{ status: 400 }
		);
	}

	const db = event.locals.db;

	try {
		const [newNode] = await db
			.update(nodes)
			.set({ ...node, userId: event.locals.user.id })
			.where(eq(nodes.id, node.id))
			.returning();
		return json({
			success: true,
			status: 200,
			data: newNode
		});
	} catch (error) {
		console.error(error);
		if (error.code === 'SQLITE_CONSTRAINT') {
			return json(
				{
					success: false,
					status: 409,
					errors: [{ message: 'Node already exists', code: 'CONFLICT' }]
				},
				{ status: 409 }
			);
		} else {
			return json(
				{
					success: false,
					status: 500,
					errors: [{ message: 'Internal Server Error', code: 'INTERNAL_SERVER_ERROR' }]
				},
				{ status: 500 }
			);
		}
	}
}) satisfies RequestHandler;

export const DELETE = (async (event) => {
	const result = deleteInputSchema.safeParse(Object.fromEntries(event.url.searchParams.entries()));
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

	try {
		await db.delete(nodes).where(and(eq(nodes.id, id), eq(nodes.userId, event.locals.user.id)));
	} catch (error) {
		console.error(error);
		return json(
			{
				success: false,
				status: 500,
				errors: [{ message: 'Internal Server Error', code: 'INTERNAL_SERVER_ERROR' }]
			},
			{ status: 500 }
		);
	}

	return json({ success: true, data: {}, status: 200 });
}) satisfies RequestHandler;
