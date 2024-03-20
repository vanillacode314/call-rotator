<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { cn } from '$/utils/ui';
	import { addFolderDialogOpen } from './modals/AddFolderModal.svelte';
	import { addListDialogOpen } from './modals/AddListModal.svelte';

	type TButton = {
		label: string;
		icon?: string;
		onclick: () => void;
	};

	const BUTTONS = [
		{
			label: 'Add Folder',
			icon: 'i-carbon:folder-add',
			onclick() {
				$addFolderDialogOpen = true;
			}
		},
		{
			label: 'Add List',
			icon: 'i-carbon:document-add',
			onclick() {
				$addListDialogOpen = true;
			}
		}
	] satisfies TButton[];

	interface $$Props {
		class?: string;
	}
</script>

<div class={cn('border-offset-background flex flex-col gap-2 border-r', $$props.class)}>
	{#each BUTTONS as button}
		<Button
			class="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-wider"
			on:click={button.onclick}
			variant="ghost"
			type="button"
		>
			<span>{button.label}</span>
			<span class={cn(button.icon, 'text-base')}></span>
		</Button>
	{/each}
</div>
