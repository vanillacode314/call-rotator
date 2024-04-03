<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const editContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { mutations } from '$/lib/db/utils/nodes';
	import { parseFormData } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { contactMetadataSchema } from '$/types/contact';
	import { useClipboard } from '$/stores/clipboard';
	import ContactForm from './ContactForm.svelte';

	const clipboard = useClipboard();

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const formData = parseFormData(
				e.target as HTMLFormElement,
				contactMetadataSchema.shape.contacts
					.removeDefault()
					.element.extend({ phone: z.string().optional() })
			);
			const originalPhone = $clipboard.contacts[0].phone;
			formData.phone = formData.phone ?? originalPhone;
			const nodeId = $clipboard.nodes[0];
			await mutations.updateMetadata(nodeId, (metadata) => {
				const parsedMetadata = contactMetadataSchema.parse(metadata);
				const contact = parsedMetadata.contacts.find((contact) => contact.phone === originalPhone);
				if (!contact) throw new Error('Contact not found');
				Object.assign(contact, formData);
				return parsedMetadata;
			});
			invalidate(`contact:${nodeId}`);
		} finally {
			$editContactModalOpen = false;
		}
	}

	$: contact = $clipboard.contacts[0];
</script>

<Dialog.Root bind:open={$editContactModalOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>Edit Contact</Dialog.Title>
				<Dialog.Description>Click save when done.</Dialog.Description>
			</Dialog.Header>
			<ContactForm contact={{ ...contact, phone: '__DISABLED__' }} />
			<Dialog.Footer>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
