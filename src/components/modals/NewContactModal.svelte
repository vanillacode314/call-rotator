<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const newContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { mutations } from '$/lib/db/utils/nodes';
	import { useFileSystem } from '$/stores/filesystem';
	import { parseFormData } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { contactMetadataSchema } from '$/types/contact';
	import { parseMetadata } from '$/utils/types';
	import ContactForm from './ContactForm.svelte';

	const { selectedNode, nodes } = useFileSystem();
	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const formData = parseFormData(
				e.target as HTMLFormElement,
				contactMetadataSchema.shape.contacts.removeDefault().element
			);
			const { metadata } = parseMetadata($selectedNode!, contactMetadataSchema);
			metadata.contacts.push(formData);
			await mutations.writeMetadata($selectedNode!.id, metadata);
			invalidate(`contact:${$selectedNode!.id}`);
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
