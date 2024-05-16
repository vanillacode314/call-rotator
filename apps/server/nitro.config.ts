//https://nitro.unjs.io/config
export default defineNitroConfig({
	srcDir: 'server',
	logLevel: 1,
	esbuild: {
		options: {
			target: 'esnext'
		}
	}
});
