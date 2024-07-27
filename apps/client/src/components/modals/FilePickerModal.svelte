<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';

	const open = writable<boolean>(false);
	const pattern = writable<string>('');
	let _resolve: (file: TNode | null) => void = () => {};
	let _reject: (file: TNode | null) => void = () => {};

	function openFilePicker(_pattern: string = '') {
		open.set(true);
		pattern.set(_pattern);
		return new Promise<TNode | null>((resolve, reject) => {
			_resolve = resolve;
			_reject = reject;
		});
	}

	export { openFilePicker };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as path from '$/utils/path';
	import * as Dialog from '$/components/ui/dialog';
	import PathCrumbs from '../PathCrumbs.svelte';
	import { tick } from 'svelte';
	import { page } from '$app/stores';
	import { createFetcher } from '$/utils/zod';
	import { getNodeByPath } from 'db/queries/v1/nodes/by-path/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { toast } from 'svelte-sonner';
	import { isFolder } from '$/utils/fs';

	let pwd = '/';
	let folders: TNode[] = [],
		files: TNode[] = [];
	let children: TNode[] | null = null;
	$: $open && updateNodes(pwd);
	const fetcher = createFetcher(fetch);

	async function updateNodes(pwd: string) {
		const db = await getSQLocalClient();
		const result = await getNodeByPath(db, $page.data.user.id, pwd, {
			includeChildren: true
		});
		if (result === null) {
			toast.error('Invalid path');
			return;
		}
		const { children } = result;
		if (pwd !== '/') {
			children.unshift({
				id: $page.data.node.parent_id,
				name: '..',
				parentId: null,
				listId: null,
				userId: $page.data.user.id
			});
		}
		folders.length = 0;
		files.length = 0;
		await tick();
		for (const node of children) {
			isFolder(node) ? folders.push(node) : files.push(node);
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
									_resolve(file);
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
						_resolve(null);
						$open = false;
					}}>Cancel</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
