import { postContact } from 'db/queries/v1/contacts/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	PostContactRequestV1Schema,
	PostContactResponseV1Schema
} from 'schema/routes/api/v1/contacts/index';

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(event, PostContactRequestV1Schema.safeParse);

	if (!result.success) {
		setResponseStatus(event, 400);
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
		const contact = await postContact(tx, event.context.user.id, { contact: result.data.contact });
		return PostContactResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { contact }
		});
	});
});
