import { GetSessionResponseV1 } from 'proto/api/v1/get-session';

export default defineEventHandler(async (event) => {
	return GetSessionResponseV1.toBinary({ user: await getUser(getHeader(event, 'Authorization')) });
});
