import path from 'path';

export default defineNitroConfig({
	srcDir: 'server',
	logLevel: 1,
	errorHandler: '~/error.ts',
	esbuild: {
		options: {
			target: 'esnext'
		}
	},
	routeRules: {
		'/api/**': { cors: true }
	},
	devServer: {
		watch: ['node_modules/db', 'node_modules/schema']
	},
	alias: {
		'~schema': path.resolve(__dirname, 'node_modules/schema/src'),
		'~db': path.resolve(__dirname, 'node_modules/db/src')
	}
});
