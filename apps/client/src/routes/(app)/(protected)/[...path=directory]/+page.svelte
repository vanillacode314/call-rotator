<script lang="ts">
	import * as path from '$/utils/path';
	import { Button } from '$/components/ui/button';
	import { addFolderModalOpen } from '$/components/modals/CreateFolderModal.svelte';
	import ContextMenuFolder from './ContextMenuFolder.svelte';
	import ContextMenuFile from './ContextMenuFile.svelte';
	import { createFileModalOpen } from '$/components/modals/CreateFileModal.svelte';
	import { useActions } from '$/stores/actions';
	import { goto, invalidate } from '$app/navigation';
	import PathCrumbs from '$/components/PathCrumbs.svelte';
	import { toast } from 'svelte-sonner';
	import { createFetcher } from '$/utils/zod';
	import { putOutputSchema as nodesPutOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { toastErrors } from '$/utils';
	import { useTaskQueue, queueTask } from '$/stores/task-queue';
	import { isServer } from '$/consts/sveltekit';

	const { actions } = useActions();
	const queue = useTaskQueue();

	export let data;

	$: ({ pwd, children } = data);

	let folders: TNode[] = [],
		files: TNode[] = [];
	$: children !== null && updateNodes(children);
	$: isEmpty = children !== null && folders.length + files.length === 0;

	const fetcher = createFetcher(fetch);

	async function updateNodes(children: TNode[]) {
		folders.length = 0;
		files.length = 0;
		for (const node of children!) {
			if (node.listId === null) {
				folders.push(node);
				continue;
			}
			files.push(node);
		}
		folders = folders;
		files = files;
	}

	$actions = [
		{
			label: 'Create Folder',
			icon: 'i-carbon:folder-add',
			onclick() {
				$addFolderModalOpen = true;
			}
		},
		{
			label: 'Create File',
			icon: 'i-carbon:document-add',
			onclick() {
				$createFileModalOpen = true;
			}
		}
	];
</script>

<div class="flex flex-col gap-4 py-4">
	<PathCrumbs path={pwd} />
	{#if data.mode === 'offline' && isServer}
		<div class="col-span-full grid place-content-center p-8">
			<div class="i-mdi:loading animate-spin text-7xl"></div>
		</div>
	{:else if isEmpty}
		{#if pwd === '/'}
			<div
				class="col-span-full grid h-full place-content-center place-items-center gap-4 text-3xl font-bold uppercase tracking-wide"
			>
				<div class="i-nimbus:box-unpacked text-5xl"></div>
				<span>No files</span>
				<div class="flex flex-col items-center gap-4 md:flex-row">
					<Button size="lg" on:click={() => ($addFolderModalOpen = true)}>Create Folder</Button>
					<span class="text-xl">OR</span>
					<Button size="lg" on:click={() => ($createFileModalOpen = true)}>Create File</Button>
				</div>
			</div>
		{/if}
	{:else}
		<ul
			class="grid h-full content-start items-start gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
		>
			{#each folders as folder}
				<ContextMenuFolder {folder}>
					<li
						class="grid"
						on:dragover={(event) => {
							event.preventDefault();
							const dt = event.dataTransfer;
							if (!dt) return;
							dt.dropEffect = 'move';
						}}
						on:dragenter={(event) => {
							event.preventDefault();
							const el = event.target;
							// @ts-ignore
							el.classList.add('ring');
							const dt = event.dataTransfer;
							if (!dt) return;
							dt.dropEffect = 'move';
						}}
						on:dragleave={(event) => {
							event.preventDefault();
							const el = event.target;
							// @ts-ignore
							el.classList.remove('ring');
						}}
						on:drop|preventDefault={async (event) => {
							const dt = event.dataTransfer;
							if (!dt) return;
							const id = Number(dt.getData('text/plain'));
							if (id === folder.id) {
								toast.error('Cannot move folder to itself');
								return;
							}
							queueTask(queue, 'Moving', async () => {
								if (data.mode === 'offline') {
									await mutations.moveNode(id, folder.id);
								} else {
									const formData = new FormData();
									formData.append('node', JSON.stringify({ id, parent_id: folder.id }));
									const result = await fetcher(nodesPutOutputSchema, `/api/v1/nodes/by-id`, {
										method: 'PUT',
										body: formData
									});
									if (!result.success) {
										toastErrors(result.errors);
									}
								}
								await invalidate(`pwd:${pwd}`);
							});
						}}
						draggable="true"
						on:dragstart={(event) => {
							const dt = event.dataTransfer;
							if (!dt) return;
							dt.setData('text/plain', String(folder.id));
							dt.effectAllowed = 'move';
						}}
					>
						<Button
							draggable="true"
							variant="secondary"
							class="flex items-center justify-start gap-2"
							on:click={() => goto(path.join(pwd, folder.name))}
						>
							<span class="i-carbon:folder"></span>
							<span class="truncate">{folder.name}</span>
						</Button>
					</li>
				</ContextMenuFolder>
			{/each}
			{#each files as file}
				<ContextMenuFile {file}>
					<li
						class="grid"
						draggable="true"
						on:dragstart={(event) => {
							const dt = event.dataTransfer;
							if (!dt) return;
							dt.setData('text/plain', String(file.id));
							dt.effectAllowed = 'move';
						}}
					>
						<Button
							variant="secondary"
							class="flex items-center justify-start gap-2"
							on:click={() => goto(path.join(pwd, file.name))}
						>
							<span class="i-carbon:document"></span>
							<span class="truncate">{file.name}</span>
						</Button>
					</li>
				</ContextMenuFile>
			{/each}
		</ul>
	{/if}
</div>
