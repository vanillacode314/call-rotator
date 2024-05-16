import { writable, type Loadable } from '@square/svelte-store';
import { getContext, setContext } from 'svelte';

type TAction = {
	label: string;
	icon?: string;
	onclick: () => void;
};
type TActionsContext = {
	actions: Loadable<TAction[]>;
};

function useActions() {
	const value = getContext<TActionsContext>('actions-context');
	if (!value) throw new Error('actions-context not found');
	return value;
}

function initActionsContext() {
	const actions = writable([]);
	return setContext<TActionsContext>('actions-context', { actions });
}

export { initActionsContext, useActions };
