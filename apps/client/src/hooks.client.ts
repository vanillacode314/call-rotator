if ('serviceWorker' in navigator && import.meta.env.PROD) {
	navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
