import { ErrorCode, ErrorResponseV1 } from 'proto/api';

export default defineEventHandler(async (event) => {
	const url = getRequestURL(event);
	const isPrivate = url.pathname.includes('private');

	if (isPrivate) {
		const user = await getUser(getHeader(event, 'Authorization'));
		if (!user) {
			setResponseStatus(event, 401);
			return ErrorResponseV1.toBinary({
				result: {
					oneofKind: 'errors',
					errors: {
						errors: [{ message: 'Unauthorized', code: ErrorCode.UNAUTHORIZED }]
					}
				}
			});
		}
	}
});
