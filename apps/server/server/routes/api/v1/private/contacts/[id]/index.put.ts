import { putContact } from 'db/queries/v1/contacts/[id]/index';
import { ApiErrorCodeSchema } from 'schema/api';
import {
	PutContactRequestV1Schema,
	PutContactResponseV1Schema
} from 'schema/routes/api/v1/contacts/[id]/index';

export default defineEventHandler(async (event) => {
	const id = +getRouterParam(event, 'id')!;
	if (!Number.isInteger(id)) {
		setResponseStatus(event, 400);
		return {
			status: 400,
			success: false,
			result: {
				issues: [
					{
						message: 'Invalid id',
						code: ApiErrorCodeSchema.enum.INVALID_QUERY
					}
				]
			}
		};
	}

	const result = await readValidatedBody(event, PutContactRequestV1Schema.safeParse);

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
		const contact = await putContact(tx, event.context.user.id, id, {
			contact: result.data.contact
		});
		return PutContactResponseV1Schema.parse({
			success: true,
			status: 200,
			result: { contact }
		});
	});
});
