<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const newContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { mutations } from '$/lib/db/utils/nodes';
	import { useFileSystem } from '$/stores/filesystem';
	import { parseFormData, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { contactMetadataSchema } from '$/types/contact';
	import { parseMetadata } from '$/utils/types';
	import ContactForm from './ContactForm.svelte';
	import { putOutputSchema as nodesPutOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { createFetcher } from '$/utils/zod';
	import { page } from '$app/stores';

	const { selectedNode } = useFileSystem();

	const fetcher = createFetcher(fetch);
	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const data = parseFormData(
				e.target as HTMLFormElement,
				contactMetadataSchema.shape.contacts.removeDefault().element
			);
			const { metadata } = parseMetadata($selectedNode!, contactMetadataSchema);
			metadata.contacts.push(data);
			if ($page.data.mode === 'offline') {
				await mutations.writeMetadata($selectedNode!.id, metadata);
			} else {
				const formData = new FormData();
				formData.set('node', JSON.stringify({ id: $selectedNode!.id, metadata }));
				const result = await fetcher(nodesPutOutputSchema, `/api/v1/nodes/by-id`, {
					method: 'PUT',
					body: formData
				});
				if (!result.success) {
					toastErrors(result.errors);
				}
			}
			await invalidate(`contact:${$selectedNode!.id}`);
		} finally {
			$newContactModalOpen = false;
		}
	}
</script>

<Dialog.Root bind:open={$newContactModalOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>New Contact</Dialog.Title>
				<Dialog.Description>Click create when done.</Dialog.Description>
			</Dialog.Header>
			<ContactForm />
			<Dialog.Footer>
				<Button type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
