import { createMiddleware } from '@solidjs/start/middleware'
import { setResponseHeaders } from 'vinxi/http'

export default createMiddleware({
	onBeforeResponse: [
		(event) => {
			setResponseHeaders(event.nativeEvent, {
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Cross-Origin-Opener-Policy': 'same-origin'
			})
		}
	]
})
