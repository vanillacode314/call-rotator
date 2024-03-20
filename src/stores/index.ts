import { getContext, setContext } from 'svelte';
import { type Writable, writable, asyncDerived, type Loadable } from '@square/svelte-store';
import { query } from '$/lib/db/utils';

type TFileSystemContext = {
	activeFolder: Writable<TFolder>;
	selectedFolder: Writable<TFolder | null>;
	selectedFile: Writable<TFile | null>;
	filesAndFolders: Loadable<{ files: TFile[]; folders: TFolder[] }>;
	changeDirectory: (id: number) => Promise<void>;
};

function useFileSystem() {
	const value = getContext<TFileSystemContext>('filesystem-context');
	if (!value) throw new Error('Filesystem context not found');
	return value;
}

function initFileSystemContext() {
	const activeFolder = writable<TFolder>({
		name: 'root',
		parent_id: null,
		id: 1
	});
	const selectedFolder = writable<TFolder | null>(null);
	const selectedFile = writable<TFile | null>(null);

	async function changeDirectory(id: number) {
		if (id === 1) {
			activeFolder.set({ name: 'root', parent_id: null, id: 1 });
		} else {
			const folder = await query.getFolder(id);
			activeFolder.set(folder);
		}
	}

	const filesAndFolders = asyncDerived(
		activeFolder,
		($activeFolder) => {
			return query.getFilesAndFolders($activeFolder.id);
		},
		{ reloadable: true, initial: { files: [], folders: [] } }
	);

	return setContext<TFileSystemContext>('filesystem-context', {
		activeFolder,
		selectedFile,
		selectedFolder,
		filesAndFolders,
		changeDirectory
	});
}

export { useFileSystem, initFileSystemContext };
