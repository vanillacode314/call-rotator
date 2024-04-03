<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';

	const open = writable<boolean>(false);
	const onPick = writable<(file: TNode | null) => void>(() => {});
	const pattern = writable<string>('');

	function openFilePicker(_onPick: (file: TNode | null) => void, _pattern: string = '') {
		onPick.set(_onPick);
		open.set(true);
		pattern.set(_pattern);
	}

	export { openFilePicker };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as path from '$/utils/path';
	import * as Dialog from '$/components/ui/dialog';
	import PathCrumbs from '../PathCrumbs.svelte';
	import { query } from '$/lib/db/utils/nodes';
	import { tick } from 'svelte';

	let pwd = '/';
	let folders: TNode[] = [],
		files: TNode[] = [];
	let children: TNode[] | null = null;
	$: $open && updateNodes(pwd);

	async function updateNodes(pwd: string) {
		const interval = setTimeout(() => (children = null), 300);
		children = (
			await Promise.all([
				query.getChildrenByPath(pwd, { returns: 'dir' }),
				query.getChildrenByPath(pwd, { returns: 'files', pattern: $pattern })
			])
		).flat();
		clearInterval(interval);
		folders.length = 0;
		files.length = 0;
		await tick();
		if (pwd !== '/') {
			folders.push({
				id: -1,
				name: '..',
				parent_id: null,
				metadata: null
			});
		}
		for (const node of children) {
			if (node.metadata === null) {
				folders.push(node);
				continue;
			}
			files.push(node);
		}
		folders = folders;
		files = files;
	}
</script>

<Dialog.Root bind:open={$open}>
	<Dialog.Content class="max-w-[75%]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>Pick a File</Dialog.Title>
				<Dialog.Description>Click select when done.</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-4 py-4">
				<PathCrumbs path={pwd} />
				<div class="grid h-full gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{#if children === null}
						<div class="col-span-full grid place-content-center p-8">
							<div class="i-mdi:loading animate-spin text-xl"></div>
						</div>
					{:else}
						{#each folders as folder}
							<Button
								variant="secondary"
								class="flex items-center justify-start gap-2"
								on:click={() => (pwd = path.join(pwd, folder.name))}
							>
								<span class="i-carbon:folder"></span>
								<span class="truncate">{folder.name}</span>
							</Button>
						{/each}
						{#each files as file}
							<Button
								variant="secondary"
								class="flex items-center justify-start gap-2"
								on:click={() => {
									$onPick(file);
									$open = false;
								}}
							>
								<span class="i-carbon:document"></span>
								<span class="truncate">{file.name}</span>
							</Button>
						{/each}
					{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button
					type="button"
					on:click={() => {
						$onPick(null);
						$open = false;
					}}>Cancel</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
