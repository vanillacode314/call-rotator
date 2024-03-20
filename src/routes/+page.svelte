<script>
	import Sidebar from '$/components/Sidebar.svelte';
	import { useFileSystem } from '$/stores';
	import { cn } from '$/utils/ui';
	import { Button } from '$/components/ui/button';
	import { goto } from '$app/navigation';
	import { addFolderDialogOpen } from '$/components/modals/AddFolderModal.svelte';
	import { addListDialogOpen } from '$/components/modals/AddListModal.svelte';
	import ContextMenuFolder from './ContextMenuFolder.svelte';
	import ContextMenuFile from './ContextMenuFile.svelte';

	const { activeFolder, filesAndFolders } = useFileSystem();

	$: isEmpty = !($filesAndFolders?.files.length || $filesAndFolders?.folders.length);
</script>

<div class="grid h-full bg-background p-0 md:grid-cols-[200px_1fr]">
	<div class="hidden md:contents">
		<Sidebar class="p-4" />
	</div>
	<div
		class={cn(
			'grid gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
			!isEmpty && 'content-start'
		)}
	>
		{#await filesAndFolders.load()}
			<div class="col-span-full grid place-content-center self-start p-8">
				<div class="i-mdi:loading animate-spin text-7xl"></div>
			</div>
		{:then}
			{#if $activeFolder.name !== 'root'}
				<Button
					variant="secondary"
					class="flex items-center justify-start gap-2"
					on:click={() => /*changeDirectory($activeFolder.parent_id ?? 1) */ {}}
				>
					<span class="i-carbon:folder"></span>
					<span>..</span>
				</Button>
			{/if}
			{#if isEmpty}
				{#if $activeFolder.name === 'root'}
					<div
						class="col-span-full grid h-full place-content-center place-items-center gap-4 text-3xl font-bold uppercase tracking-wide"
					>
						<div class="i-nimbus:box-unpacked text-5xl"></div>
						<span>No files</span>
						<div class="flex flex-col items-center gap-4 md:flex-row">
							<Button size="lg" on:click={() => ($addFolderDialogOpen = true)}
								>Add a new folder</Button
							>
							<span class="text-xl">OR</span>
							<Button size="lg" on:click={() => ($addListDialogOpen = true)}>Add a new list</Button>
						</div>
					</div>
				{/if}
			{:else}
				{#each $filesAndFolders.folders as folder}
					<ContextMenuFolder {folder}>
						<Button
							variant="secondary"
							class="flex items-center justify-start gap-2"
							on:click={() => /*changeDirectory(folder.id)*/ {}}
						>
							<span class="i-carbon:folder"></span>
							<span class="truncate">{folder.name}</span>
						</Button>
					</ContextMenuFolder>
				{/each}
				{#each $filesAndFolders.files as file}
					<ContextMenuFile {file}>
						<Button
							variant="secondary"
							class="flex items-center justify-start gap-2"
							on:click={() => goto(`/list/${file.id}`)}
						>
							<span class="i-carbon:document"></span>
							<span class="truncate">{file.name}</span>
						</Button>
					</ContextMenuFile>
				{/each}
			{/if}
		{/await}
	</div>
</div>
