import { putList } from 'db/queries/v1/lists/by-id/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	PutListByIdRequestV1Schema,
	PutListByIdResponseV1Schema
} from 'schema/routes/api/v1/lists/by-id';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
	const result1 = await getValidatedQuery(event, z.object({ id: z.coerce.number() }).safeParse);
	if (!result1.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result1: {
				issues: result1.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_QUERY
				}))
			}
		};
	}

	const result2 = await readValidatedBody(event, PutListByIdRequestV1Schema.safeParse);
	if (!result2.success) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result2: {
				issues: result2.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_FORMDATA
				}))
			}
		};
	}

	return await db.transaction(async (tx) => {
		const result3 = await putList(tx, event.context.user.id, result1.data.id, { ...result2.data });
		if (result3 === null) {
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
		return PutListByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: result3
		});
	});
});
