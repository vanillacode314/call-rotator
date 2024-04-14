<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const addFolderModalOpen = writable(false);
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
	import { mutations, query } from '$/lib/db/utils/nodes';
	import { parseFormData, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { createFetcher } from '$/utils/zod';
	import { postOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';

	$: pwd = decodeURI($page.url.pathname);
	const fetcher = createFetcher(fetch);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const formData = new FormData(e.target as HTMLFormElement);
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }));
			formData.set('node', JSON.stringify({ name, parent_id: $page.data.node.id, metadata: null }));
			if ($page.data.mode === 'offline') {
				await mutations.createNode({
					name: name,
					parent_id: $page.data.node.id,
					metadata: null
				});
			} else {
				const result = await fetcher(postOutputSchema, `/api/v1/nodes/by-id`, {
					method: 'POST',
					body: formData
				});
				if (!result.success) {
					toastErrors(result.errors);
				}
			}
			invalidate(`pwd:${pwd}`);
		} finally {
			$addFolderModalOpen = false;
		}
	}
</script>

<Dialog bind:open={$addFolderModalOpen}>
	<DialogContent class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<DialogHeader>
				<DialogTitle>Add Folder</DialogTitle>
				<DialogDescription>Add a new folder. Click add when done.</DialogDescription>
			</DialogHeader>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Name</Label>
					<Input name="name" id="name" value="New Folder" class="col-span-3" />
				</div>
			</div>
			<DialogFooter>
				<Button type="submit">Add</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
