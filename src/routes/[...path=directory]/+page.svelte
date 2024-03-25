<script lang="ts">
	import * as path from '$/utils/path';
	import { cn } from '$/utils/ui';
	import { Button } from '$/components/ui/button';
	import { addFolderModalOpen } from '$/components/modals/CreateFolderModal.svelte';
	import ContextMenuFolder from './ContextMenuFolder.svelte';
	import ContextMenuFile from './ContextMenuFile.svelte';
	import { createFileModalOpen } from '$/components/modals/CreateFileModal.svelte';
	import { useSidebar } from '$/stores/sidebar';
	import { goto } from '$app/navigation';
	import PathCrumbs from '$/components/PathCrumbs.svelte';

	const { actions } = useSidebar();

	export let data;

	$: ({ pwd, children } = data);

	let folders: TNode[] = [],
		files: TNode[] = [];
	$: isEmpty = children && children.length === 0;
	$: children && updateNodes(children);

	function updateNodes(children: TNode[]) {
		folders.length = 0;
		files.length = 0;
		for (const node of children!) {
			if (node.metadata === null) {
				folders.push(node);
				continue;
			}
			files.push(node);
		}
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
	<div
		class={cn(
			'grid h-full gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
			!isEmpty && 'content-start'
		)}
	>
		{#if children === null}
			<div class="col-span-full grid place-content-center p-8">
				<div class="i-mdi:loading animate-spin text-7xl"></div>
			</div>
		{:else}
			{#if pwd !== '/'}
				<Button
					variant="secondary"
					class="flex items-center justify-start gap-2"
					on:click={() => goto('/' + pwd.split('/').slice(0, -1).filter(Boolean).join('/'))}
				>
					<span class="i-carbon:folder"></span>
					<span>..</span>
				</Button>
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
				{#each folders as folder}
					<ContextMenuFolder {folder}>
						<Button
							variant="secondary"
							class="flex items-center justify-start gap-2"
							on:click={() => goto(path.join(pwd, folder.name))}
						>
							<span class="i-carbon:folder"></span>
							<span class="truncate">{folder.name}</span>
						</Button>
					</ContextMenuFolder>
				{/each}
				{#each files as file}
					<ContextMenuFile {file}>
						<Button
							variant="secondary"
							class="flex items-center justify-start gap-2"
							on:click={() => goto(path.join(pwd, file.name))}
						>
							<span class="i-carbon:document"></span>
							<span class="truncate">{file.name}</span>
						</Button>
					</ContextMenuFile>
				{/each}
			{/if}
		{/if}
	</div>
</div>
