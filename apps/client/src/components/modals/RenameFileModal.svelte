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
	import { parseFormData, selectInputById, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { useClipboard } from '$/stores/clipboard';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { putNode } from 'db/queries/v1/nodes/by-id/index';
	import { DEFAULT_LOCAL_USER_ID, RESERVED_FILE_NAMES } from '$/consts';
	import { createFetcher } from '$/utils/zod';
	import { toast } from 'svelte-sonner';
	import { PutNodeByIdResponseV1Schema } from 'schema/routes/api/v1/nodes/by-id';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	const clipboard = useClipboard();
	const fetcher = createFetcher(fetch, {
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});

	$: pwd = decodeURI($page.url.pathname);
	$: node = $clipboard.nodes[0]!;

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }));
			const filetype = node.name.split('.').pop()!;
			if (RESERVED_FILE_NAMES.includes(name.toLowerCase() as unknown as any)) {
				toast.error('RESERVED NAME', {
					description: `Please choose a different name. The name ${name} is reserved.`
				});
				return;
			}
			const { result, success } = await fetcher(
				PutNodeByIdResponseV1Schema,
				PUBLIC_API_BASE_URL + `/api/v1/private/nodes/by-id?id=${encodeURIComponent(node.id)}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						node: { name: `${name}.${filetype}`, parentId: $page.data.node.id }
					})
				}
			);
			if (!success) {
				toastErrors(result.issues);
				return;
			}
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
