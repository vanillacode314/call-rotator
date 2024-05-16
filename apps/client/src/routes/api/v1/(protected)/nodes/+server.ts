import { json } from '@sveltejs/kit';
import { nodes } from 'db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { postInputSchema } from './schema';

export const POST = (async (event) => {
	const result = postInputSchema.safeParse(Object.fromEntries(await event.request.formData()));
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
	const [row] = await db.select().from(nodes).where(eq(nodes.id, node.parent_id)).limit(1);

	if (row === undefined)
		return json(
			{ success: false, status: 404, errors: [{ message: 'Invalid Parent', code: 'NOT_FOUND' }] },
			{ status: 404 }
		);

	try {
		const [newNode] = await db
			.insert(nodes)
			.values({
				...node,
				userId: event.locals.user.id
			})
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
