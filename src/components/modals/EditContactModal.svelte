<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const editContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { mutations } from '$/lib/db/utils/nodes';
	import { parseFormData, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { contactMetadataSchema } from '$/types/contact';
	import { useClipboard } from '$/stores/clipboard';
	import ContactForm from './ContactForm.svelte';
	import { putOutputSchema as nodesPutOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { createFetcher } from '$/utils/zod';
	import { page } from '$app/stores';

	const clipboard = useClipboard();

	const fetcher = createFetcher(fetch);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const data = parseFormData(
				e.target as HTMLFormElement,
				contactMetadataSchema.shape.contacts
					.removeDefault()
					.element.extend({ phone: z.string().optional() })
			);
			data.phone = data.phone ?? $clipboard.contacts[0].phone;
			const node = $clipboard.nodes[0];
			const parsedMetadata = contactMetadataSchema.parse(node.metadata);
			const contact = parsedMetadata.contacts.find(
				(contact) => contact.phone === $clipboard.contacts[0].phone
			);
			if (!contact) throw new Error('Contact not found');
			Object.assign(contact, data);

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
					return;
				}
			}
			await invalidate(`contact:${node.id}`);
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
