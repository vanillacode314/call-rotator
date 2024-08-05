<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$/components/ui/dropdown-menu';
	import { Button } from '$/components/ui/button';
	import { useClipboard } from '$/stores/clipboard';
	import { editContactModalOpen } from '$/components/modals/EditContactModal.svelte';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { invalidate } from '$app/navigation';
	import { showTextModal } from '$/components/modals/TextModal.svelte';
	import { createFetcher } from '$/utils/zod';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';
	import { deleteContact } from 'db/queries/v1/contacts/[id]/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { toast } from 'svelte-sonner';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';
	import type { TContact } from 'schema/db';
	import { DeleteContactResponseV1Schema } from 'schema/routes/api/v1/contacts/[id]/index';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { toastErrors } from '$/utils';

	const clipboard = useClipboard();
	const queue = useTaskQueue();
	const fetcher = createFetcher(fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});

	export let contact: TContact;

	function removeContactFromList() {
		queueTask(queue, 'Removing', async () => {
			const { result, success } = await fetcher(
				DeleteContactResponseV1Schema,
				PUBLIC_API_BASE_URL + `/api/v1/private/contacts/${contact.id}`,
				{ method: 'DELETE' }
			);

			if (!success) {
				toastErrors(result.issues);
				throw new Error('Failed to remove contact');
			}
			await invalidate(`contacts:contacts`);
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
			on:click={() => {
				try {
					navigator.clipboard.writeText(contact.phone);
					toast.success('Copied phone to clipboard');
				} catch {
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
