<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$/components/ui/dropdown-menu';
	import { Button } from '$/components/ui/button';
	import { useClipboard } from '$/stores/clipboard';
	import { editContactModalOpen } from '$/components/modals/EditContactModal.svelte';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { mutations } from '$/lib/db/utils/nodes';
	import { invalidate } from '$app/navigation';
	import { filterInPlace, toastErrors } from '$/utils';
	import { showTextModal } from '$/components/modals/TextModal.svelte';
	import { listMetadataSchema } from '$/types/list';
	import { createFetcher } from '$/utils/zod';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';
	import {
		getOutputSchema,
		putOutputSchema as nodesPutOutputSchema
	} from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { page } from '$app/stores';

	const clipboard = useClipboard();
	const queue = useTaskQueue();
	const fetcher = createFetcher(fetch);

	export let contact: TContact & { nodeId: TNode['id'] };
	export let node: TNode;

	function removeContactFromList() {
		const parsedMetadata = listMetadataSchema.parse(node.metadata);
		filterInPlace(
			parsedMetadata.contacts.find((c) => c.phones.includes(contact.phone))!.phones,
			(phone) => phone !== contact.phone
		);
		queueTask(queue, 'Removing', async () => {
			if ($page.data.mode === 'offline') {
				await mutations.writeMetadata(node.id, parsedMetadata);
			} else {
				const formData = new FormData();
				formData.set('node', JSON.stringify({ id: node.id, metadata: parsedMetadata }));
				const result = await fetcher(nodesPutOutputSchema, `/api/v1/nodes/by-id`, {
					method: 'PUT',
					body: formData
				});
				if (!result.success) {
					toastErrors(result.errors);
				}
			}
			await invalidate(`list:${node.id}`);
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
		<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(contact.phone)}>
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
				const result = await fetcher(getOutputSchema, `/api/v1/nodes/by-id?id=${contact.nodeId}`);
				if (!result.success) {
					toastErrors(result.errors);
					return;
				}
				$clipboard.contacts = [contact];
				$clipboard.nodes = [result.data.node];
				$editContactModalOpen = true;
			}}>Edit</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
