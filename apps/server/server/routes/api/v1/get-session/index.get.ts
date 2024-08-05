import { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';

export default defineEventHandler(async (event) => {
	return GetSessionResponseV1Schema.parse({
		success: true,
		status: 200,
		user: await getUser(getCookie(event, 'jwtToken'))
	});
});
