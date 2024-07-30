<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const newContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { parseFormData, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import ContactForm from './ContactForm.svelte';
	import { postContact } from 'db/queries/v1/contacts/index';
	import {
		PostContactResponseV1Schema,
		PostContactRequestV1Schema
	} from 'schema/routes/api/v1/contacts/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';
	import { createFetcher } from '$/utils/zod';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	const fetcher = createFetcher(fetch, {
		headers: {
			Authorization: 'Bearer ' + localStorage.getItem('jwtToken'),
			'Content-Type': 'application/json'
		}
	});

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		try {
			const data = parseFormData(
				event.target as HTMLFormElement,
				PostContactRequestV1Schema.shape.contact
			);
			const [rawDb, db] = await getSQLocalClient();
			await db.transaction(async (tx) => {
				await postContact(tx, DEFAULT_LOCAL_USER_ID, { contact: data });
				const { result, success } = await fetcher(
					PostContactResponseV1Schema,
					PUBLIC_API_BASE_URL + '/api/v1/private/contacts',
					{ method: 'POST', body: JSON.stringify({ contact: data }) }
				);
				if (!success) {
					toastErrors(result.issues);
					throw new Error('Failed to create contact');
				}
			});
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
