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
	import { createFetcher } from '$/utils/zod';
	import { deleteOutputSchema as nodesDeleteOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { toastErrors } from '$/utils';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';

	const { selectedNode } = useFileSystem();
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
							if ($page.data.mode === 'offline') {
								await mutations.removeNode(folder.id);
							} else {
								const result = await fetcher(
									nodesDeleteOutputSchema,
									`/api/v1/nodes/by-id?id=${folder.id}`,
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
				$selectedNode = folder;
				$renameFolderModalOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
