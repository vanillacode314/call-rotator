import { getListByPath } from 'db/queries/v1/lists/by-path/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	GetListByPathRequestV1Schema,
	GetListByPathResponseV1Schema
} from 'schema/routes/api/v1/lists/by-path';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(
		event,
		GetListByPathRequestV1Schema.extend({
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
		const result2 = await getListByPath(tx, event.context.user.id, result.data.path);
		if (result2 === null) {
			setResponseStatus(event, 404);
			return {
				status: 404,
				success: false,
				result: {
					issues: [
						{
							message: 'List not found',
							code: ApiErrorCodeSchema.enum.NOT_FOUND
						}
					]
				}
			};
		}
		return GetListByPathResponseV1Schema.parse({
			success: true,
			status: 200,
			result: result2
		});
	});
});
