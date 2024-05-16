import { browser } from '$app/environment';

const isServer = !browser;

export { isServer };
