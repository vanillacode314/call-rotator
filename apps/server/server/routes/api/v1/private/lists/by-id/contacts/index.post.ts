import { postListContactById } from 'db/queries/v1/lists/by-id/contacts/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	PostListContactByIdRequestV1Schema,
	PostListContactByIdResponseV1Schema
} from 'schema/routes/api/v1/lists/by-id/contacts';
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

	const result2 = await readValidatedBody(event, PostListContactByIdRequestV1Schema.safeParse);
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
		const contacts = await postListContactById(tx, event.context.user.id, result1.data.id, {
			...result2.data
		});
		return PostListContactByIdResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { contacts: contacts }
		});
	});
});
