<script lang="ts">
	import { renameFileModalOpen } from '$/components/modals/RenameFileModal.svelte';
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuItem,
		ContextMenuContent
	} from '$/components/ui/context-menu';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { useTaskQueue, queueTask } from '$/stores/task-queue';
	import { useClipboard } from '$/stores/clipboard';
	import { deleteNode } from 'db/queries/v1/nodes/by-id/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';

	const clipboard = useClipboard();
	const queue = useTaskQueue();
	export let file: TNode;

	$: pwd = decodeURI($page.url.pathname);
</script>

<ContextMenu>
	<ContextMenuTrigger class="contents"><slot /></ContextMenuTrigger>
	<ContextMenuContent class="w-48">
		<ContextMenuItem
			on:click={() => {
				alert('Delete File', 'Are you sure you want to delete this file?', {
					icon: 'i-carbon:trash-can',
					async onYes() {
						queueTask(queue, 'Deleting', async () => {
							const db = await getSQLocalClient();
							await deleteNode(db, DEFAULT_LOCAL_USER_ID, file.id);
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
				$clipboard.nodes = [file];
				$renameFileModalOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
