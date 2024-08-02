export default defineEventHandler(async (event) => {
	return { success: true, status: 200, user: await getUser(getHeader(event, 'Authorization')) };
});
