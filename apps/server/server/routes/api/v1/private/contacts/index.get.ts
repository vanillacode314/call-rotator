import { getContacts } from 'db/queries/v1/contacts/index';
import { ApiErrorCodeSchema } from 'schema/api';
import { GetContactsRequestV1Schema } from 'schema/routes/api/v1/contacts/index';
export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(event, GetContactsRequestV1Schema.safeParse);
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
	const { page, itemsPerPage } = result.data;
	const { total, contacts } = await getContacts(db, event.context.user.id, { page, itemsPerPage });
	return {
		success: true,
		status: 200,
		result: {
			total,
			contacts
		}
	};
});
