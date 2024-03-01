import { AddFolderModal } from './AddFolderModal'
import { AddListModal } from './AddListModal'
import { RenameFolderModal } from './RenameFolderModal'
import { RenameListModal } from './RenameListModal'

export function AllModals() {
	return (
		<>
			<AddListModal />
			<AddFolderModal />
			<RenameFolderModal />
			<RenameListModal />
		</>
	)
}
