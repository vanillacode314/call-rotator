<script lang="ts">
	import { renameFolderModalOpen } from '$/components/modals/RenameFolderModal.svelte';
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuItem,
		ContextMenuContent
	} from '$/components/ui/context-menu';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { createFetcher } from '$/utils/zod';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';
	import { useClipboard } from '$/stores/clipboard';
	import { deleteNode } from 'db/queries/v1/nodes/by-id/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';

	const clipboard = useClipboard();
	const queue = useTaskQueue();

	$: pwd = decodeURI($page.url.pathname);

	export let folder: TNode;

	const fetcher = createFetcher(fetch);
</script>

<ContextMenu>
	<ContextMenuTrigger class="contents"><slot /></ContextMenuTrigger>
	<ContextMenuContent class="w-48">
		<ContextMenuItem
			on:click={() => {
				alert('Delete Folder', 'Are you sure you want to delete this folder?', {
					icon: 'i-carbon:trash-can',
					async onYes() {
						queueTask(queue, 'Deleting', async () => {
							const db = await getSQLocalClient();
							await deleteNode(db, $page.data.user.id, folder.id);
							await invalidate(`pwd:${pwd}`);
						});
					}
				});
			}}
		>
			<span>Delete</span>
			<span class="i-carbon:trash-can ml-auto"></span>
		</ContextMenuItem>
		<ContextMenuItem
			on:click={() => {
				$clipboard.nodes = [folder];
				$renameFolderModalOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
