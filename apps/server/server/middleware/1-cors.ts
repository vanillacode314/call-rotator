export default eventHandler((event) => {
	const origin = getHeader(event, 'origin');
	handleCors(event, {
		origin: origin ? [origin] : 'null',
		methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
		credentials: true,
		preflight: { statusCode: 204 }
	});
});
