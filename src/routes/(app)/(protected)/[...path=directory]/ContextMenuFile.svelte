<script lang="ts">
	import { renameFileModalOpen } from '$/components/modals/RenameFileModal.svelte';
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuItem,
		ContextMenuContent
	} from '$/components/ui/context-menu';
	import { mutations } from '$/lib/db/utils/nodes';
	import { useFileSystem } from '$/stores/filesystem';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { deleteOutputSchema as nodesDeleteOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { useTaskQueue, queueTask } from '$/stores/task-queue';
	import { toastErrors } from '$/utils';
	import { createFetcher } from '$/utils/zod';

	const { selectedNode } = useFileSystem();
	const queue = useTaskQueue();
	export let file: TNode;

	$: pwd = decodeURI($page.url.pathname);

	const fetcher = createFetcher(fetch);
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
							if ($page.data.mode === 'offline') {
								await mutations.removeNode(file.id);
							} else {
								const result = await fetcher(
									nodesDeleteOutputSchema,
									`/api/v1/nodes/by-id?id=${file.id}`,
									{
										method: 'DELETE'
									}
								);
								if (!result.success) {
									toastErrors(result.errors);
								}
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
				$selectedNode = file;
				$renameFileModalOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
