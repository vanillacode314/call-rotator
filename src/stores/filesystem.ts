import { query } from '$/lib/db/utils/nodes';
import { goto } from '$app/navigation';
import { asyncDerived, get, writable, type Loadable, type Writable } from '@square/svelte-store';
import { getContext, setContext } from 'svelte';

type TFileSystemContext = {
	pwd: Writable<string>;
	selectedNode: Writable<TNode | null>;
	nodes: Loadable<TNode[]>;
	cd: (path: string) => void;
};

function useFileSystem() {
	const value = getContext<TFileSystemContext>('filesystem-context');
	if (!value) throw new Error('Filesystem context not found');
	return value;
}

function initFileSystemContext() {
	const pwd = writable<string>('/');
	const selectedNode = writable<TNode | null>(null);
	const nodes = asyncDerived(
		pwd,
		($pwd) => {
			return query.getChildrenByPath($pwd);
		},
		{ reloadable: true, initial: [] }
	);
	function cd(path: string) {
		const $pwd = get(pwd);
		if (path === '..') {
			const parts = $pwd.split('/');
			parts.pop();
			path = '/' + parts.join('/');
		} else if (path.startsWith('./')) {
			path = `/${$pwd}/${path.slice(2)}`;
		}
		goto(path.replace(/\/+/g, '/'));
	}

	return setContext<TFileSystemContext>('filesystem-context', {
		pwd,
		selectedNode,
		nodes,
		cd
	});
}

export { initFileSystemContext, useFileSystem };
