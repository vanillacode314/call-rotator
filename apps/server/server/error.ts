import { ApiErrorCodeSchema } from 'schema/api';

export default defineNitroErrorHandler((error, event) => {
	console.error(error);
	setResponseHeader(event, 'Content-Type', 'application/json');
	return send(
		event,
		JSON.stringify({
			status: 500,
			success: false,
			result: {
				issues: [{ message: error.message, code: ApiErrorCodeSchema.enum.INTERNAL_SERVER_ERROR }]
			}
		})
	);
});
