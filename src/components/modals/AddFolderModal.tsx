import { createSignal } from 'solid-js'
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
import { parseFormData } from '~/utils'

export const [addFolderDialogOpen, setAddFolderDialogOpen] = createSignal(false)

export function AddFolderModal() {
	const [{}, { refetchFilesAndFolders }] = useFilesystem()
	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		try {
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }))
			await mutations.addFolder(name)
			refetchFilesAndFolders()
		} finally {
			setAddFolderDialogOpen(false)
		}
	}

	return (
		<Dialog open={addFolderDialogOpen()} onOpenChange={setAddFolderDialogOpen}>
			<DialogContent class="sm:max-w-[425px]">
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Add Folder</DialogTitle>
						<DialogDescription>Add a new folder. Click add when done.</DialogDescription>
					</DialogHeader>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="name" class="text-right">
								Name
							</Label>
							<Input name="name" id="name" value="New Folder" class="col-span-3" />
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Add</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
