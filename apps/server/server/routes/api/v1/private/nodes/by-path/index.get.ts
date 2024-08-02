import { getNodeByPath } from 'db/queries/v1/nodes/by-path/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	GetNodesByPathRequestV1Schema,
	GetNodesByPathResponseV1Schema
} from 'schema/routes/api/v1/nodes/by-path';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(
		event,
		GetNodesByPathRequestV1Schema.extend({
			path: z.string()
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
		const nodes = await getNodeByPath(tx, event.context.user.id, result.data.path, {
			...result.data
		});
		return GetNodesByPathResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { nodes }
		});
	});
});
