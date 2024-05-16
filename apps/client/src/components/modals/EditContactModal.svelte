<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const editContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { parseFormData } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { useClipboard } from '$/stores/clipboard';
	import ContactForm from './ContactForm.svelte';
	import { page } from '$app/stores';
	import { putContact } from '$/routes/api/v1/(protected)/contacts/local';
	import { putInputSchema as contactsPutInputSchema } from '$/routes/api/v1/(protected)/contacts/schema';
	import { z } from 'zod';

	const clipboard = useClipboard();

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const data = parseFormData(
				e.target as HTMLFormElement,
				contactsPutInputSchema.shape.contact.options[1].extend({
					id: z.coerce.number()
				})
			);
			if ($page.data.mode === 'offline') {
				await putContact({ contact: data });
			} else {
			}
			await invalidate(`contacts:contacts`);
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
			<ContactForm contact={{ ...contact }} />
			<Dialog.Footer>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
