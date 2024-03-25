<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const renameFileModalOpen = writable(false);
</script>

<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$/components/ui/dialog';
	import { Input } from '$/components/ui/input';
	import { Label } from '$/components/ui/label';
	import { mutations } from '$/lib/db/utils/nodes';
	import { useFileSystem } from '$/stores/filesystem';
	import { parseFormData, selectInputById } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	const { selectedNode } = useFileSystem();

	$: pwd = decodeURI($page.url.pathname);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }));
			const filetype = $selectedNode!.name.split('.').pop()!;
			await mutations.renameNode($selectedNode!.id, `${name}.${filetype}`);
			invalidate(`pwd:${pwd}`);
		} finally {
			$renameFileModalOpen = false;
		}
	}
</script>

<Dialog
	bind:open={$renameFileModalOpen}
	onOpenChange={() => {
		if (!open) return;
		if (!$selectedNode) {
			$renameFileModalOpen = false;
			console.error('No file selected');
			return;
		}
		setTimeout(() => selectInputById('name'));
	}}
>
	<DialogContent class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<DialogHeader>
				<DialogTitle>Rename File</DialogTitle>
				<DialogDescription>Click rename when done.</DialogDescription>
			</DialogHeader>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Name</Label>
					<Input
						name="name"
						id="name"
						value={$selectedNode?.name.replace(/\.[\w]+$/, '')}
						class="col-span-3"
					/>
				</div>
			</div>
			<DialogFooter>
				<Button type="submit">Rename</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
