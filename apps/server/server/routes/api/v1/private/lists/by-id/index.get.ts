import { getListById } from 'db/queries/v1/lists/by-id/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	GetListByIdRequestV1Schema,
	GetListByIdResponseV1Schema
} from 'schema/routes/api/v1/lists/by-id';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(
		event,
		GetListByIdRequestV1Schema.extend({ id: z.coerce.number() }).safeParse
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
		const result2 = await getListById(tx, event.context.user.id, result.data.id);
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
		return GetListByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: result2
		});
	});
});
