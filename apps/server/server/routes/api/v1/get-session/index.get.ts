export default defineEventHandler(async (event) => {
	return { status: 200, user: await getUser(getHeader(event, 'Authorization')) };
});
