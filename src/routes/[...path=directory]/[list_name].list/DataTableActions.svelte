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
	import { listMetadataSchema } from '$/types/list';

	const clipboard = useClipboard();

	export let contact: TContact & { nodeId: TNode['id'] };
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
				alert('Remove Contact', 'Are you sure you want to remove this contact from this list?', {
					icon: 'i-carbon:trash-can',
					onYes: async () => {
						await mutations.updateMetadata(nodeId, (metadata) => {
							const parsedMetadata = listMetadataSchema.parse(metadata);
							filterInPlace(
								parsedMetadata.contacts[contact.nodeId],
								(phone) => phone !== contact.phone
							);
							return parsedMetadata;
						});
						invalidate(`list:${nodeId}`);
					}
				});
			}}>Remove</DropdownMenu.Item
		>
		<DropdownMenu.Item
			on:click={() => {
				$clipboard.contacts = [contact];
				$clipboard.nodes = [contact.nodeId];
				$editContactModalOpen = true;
			}}>Edit</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
