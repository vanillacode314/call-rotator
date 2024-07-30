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
	import { useTaskQueue, queueTask } from '$/stores/task-queue';
	import { putNode } from 'db/queries/v1/nodes/by-id/index';
	import { DEFAULT_LOCAL_USER_ID, RESERVED_FILE_DATA_MAP, RESERVED_FILE_NAMES } from '$/consts';
	import { page } from '$app/stores';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';

	const { actions } = useActions();
	const queue = useTaskQueue();

	export let data;

	$: ({ pwd, children } = data);

	let folders: TNode[] = [],
		files: TNode[] = [];
	$: children !== null && updateNodes(children);
	$: isEmpty = children !== null && folders.length + files.length === 0;

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
	{#if pwd === '/'}
		<ul
			class="grid content-start items-start gap-2 border-b-2 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
		>
			{#each RESERVED_FILE_NAMES as filename}
				<li class="grid">
					<Button
						variant="secondary"
						class="flex items-center justify-start gap-2"
						on:click={() => goto(RESERVED_FILE_DATA_MAP[filename].url)}
					>
						<span class={RESERVED_FILE_DATA_MAP[filename].icon}></span>
						<span class="truncate">{RESERVED_FILE_DATA_MAP[filename].label}</span>
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
	{#if isEmpty}
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
								const [rawDb, db] = await getSQLocalClient();
								await putNode(db, DEFAULT_LOCAL_USER_ID, id, { node: { parentId: folder.id } });
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
