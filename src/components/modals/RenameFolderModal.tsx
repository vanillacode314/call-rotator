import { createEffect, createRenderEffect, createSignal, on } from 'solid-js'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { mutations } from '~/lib/db/utils'
import { useFilesystem } from '~/stores'
import { parseFormData, selectInputById } from '~/utils'

export const [renameFolderDialogOpen, setRenameFolderDialogOpen] = createSignal(false)

export function RenameFolderModal() {
	const [{ selectedFolder }, { refetchFilesAndFolders }] = useFilesystem()
	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		try {
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }))
			await mutations.renameFolder(selectedFolder()!.id, name)
			refetchFilesAndFolders()
		} finally {
			setRenameFolderDialogOpen(false)
		}
	}

	createRenderEffect(
		on(renameFolderDialogOpen, (open) => {
			if (!open) return
			if (!selectedFolder()) {
				setRenameFolderDialogOpen(false)
				console.error('No folder selected')
			}
		})
	)

	createEffect(
		on(renameFolderDialogOpen, (open) => {
			if (!open) return
			if (!selectedFolder()) return
			setTimeout(() => selectInputById('name'))
		})
	)

	return (
		<Dialog open={renameFolderDialogOpen()} onOpenChange={setRenameFolderDialogOpen}>
			<DialogContent class="sm:max-w-[425px]">
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Rename Folder</DialogTitle>
						<DialogDescription>Rename a folder. Click rename when done.</DialogDescription>
					</DialogHeader>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="name" class="text-right">
								Name
							</Label>
							<Input name="name" id="name" value={selectedFolder()!.name} class="col-span-3" />
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Rename</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
