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
	import { parseFormData, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { createFetcher } from '$/utils/zod';
	import { postNode } from 'db/queries/v1/nodes/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID, RESERVED_FILE_NAMES } from '$/consts';
	import { toast } from 'svelte-sonner';

	$: pwd = decodeURI($page.url.pathname);
	const fetcher = createFetcher(fetch);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const formData = new FormData(e.target as HTMLFormElement);
			const { name } = parseFormData(e.target as HTMLFormElement, z.object({ name: z.string() }));
			if (RESERVED_FILE_NAMES.includes(name.toLowerCase() as unknown as any)) {
				toast.error('RESERVED NAME', {
					description: `Please choose a different name. The name ${name} is reserved.`
				});
				return;
			}
			formData.set('node', JSON.stringify({ name, parent_id: $page.data.node.id, metadata: null }));
			const [rawDb, db] = await getSQLocalClient();
			await postNode(db, DEFAULT_LOCAL_USER_ID, {
				node: { name: name, parentId: $page.data.node.id, listId: null }
			});
			await invalidate(`pwd:${pwd}`);
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
