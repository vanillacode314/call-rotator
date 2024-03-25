import { writable } from '@square/svelte-store';

const mode = writable<'offline' | 'online'>('offline');
let $mode!: 'offline' | 'online';
mode.subscribe((value) => ($mode = value));

export { $mode, mode };
