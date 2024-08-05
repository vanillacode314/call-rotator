import { postNode } from 'db/queries/v1/nodes/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	PostNodeRequestV1Schema,
	PostNodeResponseV1Schema
} from 'schema/routes/api/v1/nodes/index';

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(event, PostNodeRequestV1Schema.safeParse);
	if (!result.success) {
		setResponseStatus(event, 400);
		console.error(result.error.errors);
		return {
			status: 400,
			success: false,
			result: {
				issues: result.error.errors.map((error) => ({
					message: error.message,
					code: ApiErrorCodeSchema.enum.INVALID_FORMDATA
				}))
			}
		};
	}

	return await db.transaction(async (tx) => {
		const node = await postNode(tx, event.context.user.id, { node: result.data.node });
		return PostNodeResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { node }
		});
	});
});
