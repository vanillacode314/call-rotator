import { defineConfig } from '@solidjs/start/config'
import UnoCSS from 'unocss/vite'

export default defineConfig({
	vite: {
		plugins: [
			{
				name: 'configure-response-headers',
				configureServer: (server) => {
					server.middlewares.use((_req, res, next) => {
						res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
						res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
						next()
					})
				}
			},
			UnoCSS()
		],
		optimizeDeps: {
			exclude: ['sqlocal']
		}
	},
	ssr: false
})
