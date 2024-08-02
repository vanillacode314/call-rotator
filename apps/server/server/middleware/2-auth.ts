import { ApiErrorCodeSchema } from 'schema/api';

export default defineEventHandler(async (event) => {
	const url = getRequestURL(event);
	const isPrivate = url.pathname.includes('private');
	const user = await getUser(getHeader(event, 'Authorization'));
	// @ts-ignore: assigning null here is fine since it'll return 401 if user is null for private route and public routes should not be using event.context.user
	event.context.user = user;

	if (isPrivate) {
		if (!user) {
			setResponseStatus(event, 401);
			return {
				status: 401,
				success: false,
				result: {
					issues: [{ message: 'Unauthorized', code: ApiErrorCodeSchema.enum.UNAUTHORIZED }]
				}
			};
		}
	}
});
