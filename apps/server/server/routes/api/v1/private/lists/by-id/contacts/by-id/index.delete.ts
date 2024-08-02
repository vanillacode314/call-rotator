import { deleteListContactById } from 'db/queries/v1/lists/by-id/contacts/by-id/index';
import { ApiErrorCodeSchema } from 'schema/api';
import { DeleteNodeByIdResponseV1Schema } from 'schema/routes/api/v1/nodes/by-id';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(
		event,
		z.object({
			listId: z.coerce.number(),
			contactIds: z
				.string()
				.refine((value) => value.split(';').every((id) => Number.isInteger(+id)))
				.transform((value) => value.split(';').map((id) => +id))
		}).safeParse
	);
	if (!result.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result: {
				issues: result.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_QUERY
				}))
			}
		};
	}

	return await db.transaction(async (tx) => {
		await deleteListContactById(tx, result.data.listId, result.data.contactIds);
		return DeleteNodeByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: {}
		});
	});
});
