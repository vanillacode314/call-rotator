import { writable, type Loadable } from '@square/svelte-store';
import { getContext, setContext } from 'svelte';

type TSidebarAction = {
	label: string;
	icon?: string;
	onclick: () => void;
};
type TSidebarContext = {
	actions: Loadable<TSidebarAction[]>;
};

function useActions() {
	const value = getContext<TSidebarContext>('sidebar-context');
	if (!value) throw new Error('Sidebar context not found');
	return value;
}

function initActionsContext() {
	const actions = writable([]);
	return setContext<TSidebarContext>('sidebar-context', { actions });
}

export { initActionsContext, useActions };
