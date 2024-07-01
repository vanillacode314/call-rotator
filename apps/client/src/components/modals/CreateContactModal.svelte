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
	import { page } from '$app/stores';
	import { postContact } from 'db/queries/v1/contacts/index';
	import { PostContactsRequestV1Schema } from 'schema/routes/api/v1/contacts/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const data = parseFormData(
				e.target as HTMLFormElement,
				PostContactsRequestV1Schema.shape.contact
			);
			const db = await getSQLocalClient();
			await postContact(db, DEFAULT_LOCAL_USER_ID, { contact: data });
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
