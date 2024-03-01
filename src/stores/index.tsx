import {
	Accessor,
	InitializedResource,
	ParentComponent,
	Setter,
	createContext,
	createResource,
	createSignal,
	useContext
} from 'solid-js'
import { query } from '~/lib/db/utils'

const FilesystemContext = createContext<
	[
		{
			filesAndFolders: InitializedResource<{
				files: TFile[]
				folders: TFolder[]
			}>
			activeFolder: Accessor<TFolder>
			selectedFolder: Accessor<TFolder | null>
			selectedFile: Accessor<TFile | null>
		},
		{
			setActiveFolder: Setter<TFolder>
			setSelectedFolder: Setter<TFolder | null>
			setSelectedFile: Setter<TFile | null>
			changeDirectory: (id: number) => Promise<void>
			refetchFilesAndFolders: () => MaybePromise<unknown>
		}
	]
>()

function useFilesystem() {
	return useContext(FilesystemContext)!
}
const FilesystemContextProvider: ParentComponent = (props) => {
	const [activeFolder, setActiveFolder] = createSignal<TFolder>({
		name: 'root',
		parent_id: null,
		id: 1
	})
	const [selectedFolder, setSelectedFolder] = createSignal<TFolder | null>(null)
	const [selectedFile, setSelectedFile] = createSignal<TFile | null>(null)

	async function changeDirectory(id: number) {
		if (id === 1) {
			setActiveFolder({ name: 'root', parent_id: null, id: 1 })
		} else {
			const folder = await query.getFolder(id)
			setActiveFolder(folder)
		}
	}
	const [filesAndFolders, { refetch: refetchFilesAndFolders, mutate }] = createResource<
		{
			files: TFile[]
			folders: TFolder[]
		},
		number
	>(
		() => activeFolder().id,
		() => query.getFilesAndFolders(activeFolder().id),
		{
			initialValue: { files: [], folders: [] }
		}
	)
	return (
		<FilesystemContext.Provider
			value={[
				{ filesAndFolders, activeFolder, selectedFile, selectedFolder },
				{
					setSelectedFile,
					setSelectedFolder,
					setActiveFolder,
					changeDirectory,
					refetchFilesAndFolders
				}
			]}
		>
			{props.children}
		</FilesystemContext.Provider>
	)
}

export { FilesystemContextProvider, useFilesystem }
