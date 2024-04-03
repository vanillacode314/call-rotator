<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$/components/ui/dropdown-menu';
	import { Button } from '$/components/ui/button';
	import { useClipboard } from '$/stores/clipboard';
	import { editContactModalOpen } from '$/components/modals/EditContactModal.svelte';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { mutations } from '$/lib/db/utils/nodes';
	import { contactMetadataSchema } from '$/types/contact';
	import { invalidate } from '$app/navigation';
	import { filterInPlace } from '$/utils';
	import { showTextModal } from '$/components/modals/TextModal.svelte';

	const clipboard = useClipboard();

	export let contact: TContact;
	export let nodeId: TNode['id'];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(contact.phone)}>
				Copy phone
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => showTextModal(contact.notes)}>See Notes</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			on:click={() => {
				alert('Delete Contact', 'Are you sure you want to delete this contact?', {
					icon: 'i-carbon:trash-can',
					onYes: async () => {
						await mutations.updateMetadata(nodeId, (metadata) => {
							const parsedMetadata = contactMetadataSchema.parse(metadata);
							filterInPlace(parsedMetadata.contacts, (c) => c.phone !== contact.phone);
							return parsedMetadata;
						});
						invalidate(`contact:${nodeId}`);
					}
				});
			}}>Delete</DropdownMenu.Item
		>
		<DropdownMenu.Item
			on:click={() => {
				$clipboard.contacts = [contact];
				$clipboard.nodes = [nodeId];
				$editContactModalOpen = true;
			}}>Edit</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
