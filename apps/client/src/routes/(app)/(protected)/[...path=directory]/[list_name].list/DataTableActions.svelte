<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$/components/ui/dropdown-menu';
	import { Button } from '$/components/ui/button';
	import { useClipboard } from '$/stores/clipboard';
	import { editContactModalOpen } from '$/components/modals/EditContactModal.svelte';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { showTextModal } from '$/components/modals/TextModal.svelte';
	import { createFetcher } from '$/utils/zod';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';
	import { toast } from 'svelte-sonner';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { deleteListContactById } from 'db/queries/v1/lists/by-id/contacts/by-id/index';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import type { TList, TContact } from 'schema/db';

	const clipboard = useClipboard();
	const queue = useTaskQueue();
	const fetcher = createFetcher(fetch);

	export let contact: TContact;
	export let list: TList;

	function removeContactFromList() {
		queueTask(queue, 'Removing', async () => {
			const [rawDb, db] = await getSQLocalClient();
			await deleteListContactById(db, list.id, [contact.id]);
			await invalidate(`list:${$page.data.pwd}`);
		});
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item
			on:click={async () => {
				try {
					await navigator.clipboard.writeText(contact.phone);
					toast.success('Copied phone to clipboard');
				} catch (e) {
					console.error(e);
					toast.error('Failed to copy phone');
				}
			}}
		>
			Copy phone
		</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => showTextModal(contact.notes)}>See Notes</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			on:click={() => {
				alert('Remove Contact', 'Are you sure you want to remove this contact from this list?', {
					icon: 'i-carbon:trash-can',
					onYes: removeContactFromList
				});
			}}>Remove</DropdownMenu.Item
		>
		<DropdownMenu.Item
			on:click={async () => {
				$clipboard.contacts = [contact];
				$editContactModalOpen = true;
			}}>Edit</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
