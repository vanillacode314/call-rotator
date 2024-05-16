<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const newContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { parseFormData } from '$/utils';
	import { invalidate } from '$app/navigation';
	import ContactForm from './ContactForm.svelte';
	import { createFetcher } from '$/utils/zod';
	import { page } from '$app/stores';
	import { postContact } from '$/routes/api/v1/(protected)/contacts/local';
	import { postInputSchema as contactsPostInputSchema } from '$/routes/api/v1/(protected)/contacts/schema';

	const fetcher = createFetcher(fetch);
	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const data = parseFormData(
				e.target as HTMLFormElement,
				contactsPostInputSchema.shape.contact
			);
			if ($page.data.mode === 'offline') {
				await postContact({ contact: data });
			} else {
			}
			await invalidate(`contacts:contacts`);
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
