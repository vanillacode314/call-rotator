import { For } from 'solid-js'
import { setAddFolderDialogOpen } from '~/components/modals/AddFolderModal'
import { setAddListDialogOpen } from '~/components/modals/AddListModal'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type TButton = {
	label: string
	icon?: string
	onClick: () => void
}

const BUTTONS = [
	{
		label: 'Add Folder',
		icon: 'i-carbon:folder-add',
		onClick: () => {
			setAddFolderDialogOpen(true)
		}
	},
	{
		label: 'Add List',
		icon: 'i-carbon:document-add',
		onClick: () => {
			setAddListDialogOpen(true)
		}
	}
] satisfies TButton[]

export function Sidebar(props: { class?: string }) {
	return (
		<div class={cn('flex flex-col gap-2 border-r border-offset-background', props.class)}>
			<For each={BUTTONS}>
				{(button) => (
					<Button
						class="flex gap-2 items-center uppercase text-xs font-bold tracking-wider justify-end"
						onClick={button.onClick}
						variant="ghost"
						type="button"
					>
						<span>{button.label}</span>
						<span class={cn(button.icon, 'text-base')}></span>
					</Button>
				)}
			</For>
		</div>
	)
}
