export default eventHandler((event) => {
	handleCors(event, { origin: '*', methods: '*', preflight: { statusCode: 204 } });
});
