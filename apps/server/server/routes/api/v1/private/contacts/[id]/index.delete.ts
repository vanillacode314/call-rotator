import { deleteContact } from 'db/queries/v1/contacts/[id]/index';
import { ApiErrorCodeSchema } from 'schema/api';
import { DeleteContactResponseV1Schema } from 'schema/routes/api/v1/contacts/[id]/index';

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

	return await db.transaction(async (tx) => {
		await deleteContact(tx, event.context.user.id, id);
		return DeleteContactResponseV1Schema.parse({
			success: true,
			status: 200,
			result: {}
		});
	});
});
