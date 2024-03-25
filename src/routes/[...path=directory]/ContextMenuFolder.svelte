<script lang="ts">
	import { renameFolderModalOpen } from '$/components/modals/RenameFolderModal.svelte';
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuItem,
		ContextMenuContent
	} from '$/components/ui/context-menu';
	import { mutations } from '$/lib/db/utils/nodes';
	import { useFileSystem } from '$/stores/filesystem';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';

	const { selectedNode, nodes } = useFileSystem();

	$: pwd = decodeURI($page.url.pathname);

	export let folder: TNode;
</script>

<ContextMenu>
	<ContextMenuTrigger class="contents"><slot /></ContextMenuTrigger>
	<ContextMenuContent class="w-48">
		<ContextMenuItem
			on:click={() => {
				alert('Delete Folder', 'Are you sure you want to delete this folder?', {
					icon: 'i-carbon:trash-can',
					onYes: () => mutations.removeNode(folder.id).then(() => invalidate(`pwd:${pwd}`))
				});
			}}
		>
			<span>Delete</span>
			<span class="i-carbon:trash-can ml-auto"></span>
		</ContextMenuItem>
		<ContextMenuItem
			on:click={() => {
				$selectedNode = folder;
				$renameFolderModalOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
