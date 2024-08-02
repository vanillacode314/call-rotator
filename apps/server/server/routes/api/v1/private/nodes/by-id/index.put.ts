import { putNode } from 'db/queries/v1/nodes/by-id/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	PutNodeByIdRequestV1Schema,
	PutNodeByIdResponseV1Schema
} from 'schema/routes/api/v1/nodes/by-id';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result1 = await getValidatedQuery(event, z.object({ id: z.coerce.number() }).safeParse);
	if (!result1.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result: {
				issues: result1.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_QUERY
				}))
			}
		};
	}

	const result2 = await readValidatedBody(event, PutNodeByIdRequestV1Schema.safeParse);
	if (!result2.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result: {
				issues: result2.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_FORMDATA
				}))
			}
		};
	}

	return await db.transaction(async (tx) => {
		const node = await putNode(tx, event.context.user.id, result1.data.id, {
			node: result2.data.node
		});
		return PutNodeByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { node }
		});
	});
});
