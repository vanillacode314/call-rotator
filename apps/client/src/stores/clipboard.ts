import { writable, type Writable } from '@square/svelte-store';
import { getContext, setContext } from 'svelte';

type TClipboardContext = Writable<{
	contacts: TContact[];
	nodes: TNode[];
}>;

function useClipboard() {
	return getContext<TClipboardContext>('clipboard-context');
}

function initClipboardContext() {
	return setContext<TClipboardContext>(
		'clipboard-context',
		writable({
			contacts: [],
			nodes: []
		})
	);
}

export { initClipboardContext, useClipboard };
