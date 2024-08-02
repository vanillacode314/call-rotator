import { getNodeById } from 'db/queries/v1/nodes/by-id/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	GetNodeByIdRequestV1Schema,
	GetNodeByIdResponseV1Schema
} from 'schema/routes/api/v1/nodes/by-id';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(
		event,
		GetNodeByIdRequestV1Schema.extend({
			id: z.coerce.number()
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
		const nodes = await getNodeById(tx, event.context.user.id, result.data.id, {
			...result.data
		});
		return GetNodeByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { nodes }
		});
	});
});
