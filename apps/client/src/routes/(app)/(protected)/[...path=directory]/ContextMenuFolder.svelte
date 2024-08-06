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
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { DeleteNodeByIdResponseV1Schema } from 'schema/routes/api/v1/nodes/by-id';
	import { toastErrors } from '$/utils';
	import { type TNode } from 'schema/db';

	const clipboard = useClipboard();
	const queue = useTaskQueue();
	const fetcher = createFetcher(fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});
	export let folder: TNode, pwd: string;
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
							const { result, success } = await fetcher(
								DeleteNodeByIdResponseV1Schema,
								PUBLIC_API_BASE_URL +
									`/api/v1/private/nodes/by-id?id=${encodeURIComponent(folder.id)}`,
								{ method: 'DELETE' }
							);
							if (!success) {
								toastErrors(result.issues);
								return;
							}
							await invalidate(`pwd:${encodeURI(pwd)}`);
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
