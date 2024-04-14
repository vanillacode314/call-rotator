<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$/components/ui/dropdown-menu';
	import { Button } from '$/components/ui/button';
	import { useClipboard } from '$/stores/clipboard';
	import { editContactModalOpen } from '$/components/modals/EditContactModal.svelte';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { mutations as contactMutations } from '$/lib/db/utils/contact';
	import { invalidate } from '$app/navigation';
	import { showTextModal } from '$/components/modals/TextModal.svelte';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';
	import { page } from '$app/stores';
	import { createFetcher } from '$/utils/zod';
	import { putOutputSchema as nodesPutOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { contactMetadataSchema } from '$/types/contact';
	import { parseMetadata } from '$/utils/types';
	import { filterInPlace, toastErrors } from '$/utils';

	const clipboard = useClipboard();
	const queue = useTaskQueue();

	export let contact: TContact;
	export let node: TNode;

	const fetcher = createFetcher(fetch);
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
				alert(
					'Delete Contact',
					'Are you sure you want to delete this contact? All lists using this contact will be updated',
					{
						icon: 'i-carbon:trash-can',
						onYes() {
							return queueTask(queue, 'Deleting', async () => {
								if ($page.data.mode === 'offline') {
									await contactMutations.removePhones(node.id, [contact.phone]);
								} else {
									const formData = new FormData();
									const parsedNode = parseMetadata(node, contactMetadataSchema);
									filterInPlace(parsedNode.metadata.contacts, (c) => c.phone !== contact.phone);
									formData.set('node', JSON.stringify({ ...node, metadata: parsedNode.metadata }));
									const result = await fetcher(nodesPutOutputSchema, `/api/v1/nodes/by-id`, {
										method: 'PUT',
										body: formData
									});
									if (!result.success) {
										toastErrors(result.errors);
									}
									await invalidate(`contact:${node.id}`);
								}
							});
						}
					}
				);
			}}>Delete</DropdownMenu.Item
		>
		<DropdownMenu.Item
			on:click={() => {
				$clipboard.contacts = [contact];
				$clipboard.nodes = [node];
				$editContactModalOpen = true;
			}}>Edit</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
