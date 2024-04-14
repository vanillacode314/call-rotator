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
	import { query } from '$/lib/db/utils/nodes';
	import { tick } from 'svelte';
	import { page } from '$app/stores';
	import { getOutputSchema as nodesGetOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-path/schema';
	import { toastErrors } from '$/utils';
	import { createFetcher } from '$/utils/zod';

	let pwd = '/';
	let folders: TNode[] = [],
		files: TNode[] = [];
	let children: TNode[] | null = null;
	$: $open && updateNodes(pwd);
	const fetcher = createFetcher(fetch);

	async function updateNodes(pwd: string) {
		const interval = setTimeout(() => (children = null), 300);
		if ($page.data.mode === 'offline') {
			children = (
				await Promise.all([
					query.getChildrenByPath(pwd, { returns: 'dir' }).then(([, v]) => v ?? []),
					query
						.getChildrenByPath(pwd, { returns: 'files', pattern: $pattern })
						.then(([, v]) => v ?? [])
				])
			).flat();
		} else {
			const searchParams = new URLSearchParams();
			searchParams.set('path', pwd);
			searchParams.set('includeChildren', 'true');
			const result = await fetcher(
				nodesGetOutputSchema,
				'/api/v1/nodes/by-path?' + searchParams.toString()
			);
			if (!result.success) {
				toastErrors(result.errors);
				return;
			}
			({ children } = result.data);
		}
		clearInterval(interval);
		if (children === null) return;
		if (pwd !== '/') {
			children.unshift({
				id: $page.data.node.parent_id,
				name: '..',
				parent_id: null,
				metadata: null
			});
		}
		folders.length = 0;
		files.length = 0;
		await tick();
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
