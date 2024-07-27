import path from 'path';

export default defineNitroConfig({
	srcDir: 'server',
	logLevel: 1,
	errorHandler: '~/error.ts',
	preset: 'netlify',
	esbuild: {
		options: {
			target: 'esnext'
		}
	},
	alias: {
		'~schema': path.resolve(__dirname, 'node_modules/schema/src'),
		'~db': path.resolve(__dirname, 'node_modules/db/src')
	}
});
