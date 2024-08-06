export default eventHandler((event) => {
	handleCors(event, {
		origin: '*',
		methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
		credentials: true,
		preflight: { statusCode: 204 }
	});
});
