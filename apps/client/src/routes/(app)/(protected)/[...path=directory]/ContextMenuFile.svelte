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
	import { createFetcher } from '$/utils/zod';
	import { type TNode } from 'schema/db';
	import { DeleteNodeByIdResponseV1Schema } from 'schema/routes/api/v1/nodes/by-id';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { toastErrors } from '$/utils';

	const clipboard = useClipboard();
	const queue = useTaskQueue();
	const fetcher = createFetcher(fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});
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
							const { result, success } = await fetcher(
								DeleteNodeByIdResponseV1Schema,
								PUBLIC_API_BASE_URL +
									`/api/v1/private/nodes/by-id?id=${encodeURIComponent(file.id)}`,
								{ method: 'DELETE' }
							);
							if (!success) {
								toastErrors(result.issues);
								return;
							}
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
