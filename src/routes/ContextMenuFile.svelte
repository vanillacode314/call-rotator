<script lang="ts">
	import { renameListDialogOpen } from '$/components/modals/RenameListModal.svelte';
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuItem,
		ContextMenuContent
	} from '$/components/ui/context-menu';
	import { mutations } from '$/lib/db/utils';
	import { useFileSystem } from '$/stores';

	const { selectedFile, filesAndFolders } = useFileSystem();

	export let file: TFile;
</script>

<ContextMenu>
	<ContextMenuTrigger class="contents"><slot /></ContextMenuTrigger>
	<ContextMenuContent class="w-48">
		<ContextMenuItem
			on:click={() => mutations.deleteFiles([file.id]).then(() => filesAndFolders.reload?.())}
		>
			<span>Delete</span>
			<span class="i-carbon:trash-can ml-auto"></span>
		</ContextMenuItem>
		<ContextMenuItem
			on:click={() => {
				$selectedFile = file;
				$renameListDialogOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
