async function getSQLocalDB() {
	return await import('$/lib/db/sqlocal.client');
}

export { getSQLocalDB };
