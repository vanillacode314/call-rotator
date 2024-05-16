import { browser } from '$app/environment';
import { writable } from '@square/svelte-store';

const isOnline = writable<boolean>(browser ? navigator.onLine : true);
if (browser) {
	window.addEventListener('online', () => {
		isOnline.set(true);
	});
	window.addEventListener('offline', () => {
		isOnline.set(false);
	});
}

export { isOnline };
