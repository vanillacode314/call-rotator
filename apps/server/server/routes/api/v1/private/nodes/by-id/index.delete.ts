import { deleteNode } from 'db/queries/v1/nodes/by-id/index';
import { ApiErrorCodeSchema } from 'schema/api';
import { DeleteNodeByIdResponseV1Schema } from 'schema/routes/api/v1/nodes/by-id';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(event, z.object({ id: z.coerce.number() }).safeParse);
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
		await deleteNode(tx, event.context.user.id, result.data.id);
		return DeleteNodeByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: {}
		});
	});
});
