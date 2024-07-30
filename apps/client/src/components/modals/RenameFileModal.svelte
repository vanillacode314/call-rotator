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
	import { parseFormData, selectInputById } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { useClipboard } from '$/stores/clipboard';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { putNode } from 'db/queries/v1/nodes/by-id/index';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';

	const clipboard = useClipboard();

	$: pwd = decodeURI($page.url.pathname);
	$: node = $clipboard.nodes[0]!;

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }));
			const filetype = node.name.split('.').pop()!;
			const [rawDb, db] = await getSQLocalClient();
			await putNode(db, DEFAULT_LOCAL_USER_ID, node.id, { node: { name: `${name}.${filetype}` } });
			await invalidate(`pwd:${pwd}`);
		} finally {
			$renameFileModalOpen = false;
		}
	}
</script>

<Dialog
	bind:open={$renameFileModalOpen}
	onOpenChange={() => {
		if (!open) return;
		if (!node) {
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
						value={node.name.replace(/\.[\w]+$/, '')}
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
