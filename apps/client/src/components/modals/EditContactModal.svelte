<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const editContactModalOpen = writable(false);
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { parseFormData, toastErrors } from '$/utils';
	import { invalidate } from '$app/navigation';
	import { useClipboard } from '$/stores/clipboard';
	import ContactForm from './ContactForm.svelte';
	import {
		PutContactRequestV1Schema,
		PutContactResponseV1Schema
	} from 'schema/routes/api/v1/contacts/[id]/index';
	import { putContact } from 'db/queries/v1/contacts/[id]/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { createFetcher } from '$/utils/zod';

	const clipboard = useClipboard();
	const fetcher = createFetcher(fetch, {
		headers: {
			Authorization: 'Bearer ' + localStorage.getItem('jwtToken'),
			'Content-Type': 'application/json'
		}
	});

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const data = parseFormData(
				e.target as HTMLFormElement,
				PutContactRequestV1Schema.shape.contact
			);
			const [rawDb, db] = await getSQLocalClient();
			await db.transaction(async (tx) => {
				await putContact(db, DEFAULT_LOCAL_USER_ID, contact.id, { contact: data });
				const { result, success } = await fetcher(
					PutContactResponseV1Schema,
					PUBLIC_API_BASE_URL + `/api/v1/private/contacts/${contact.id}`,
					{ method: 'PUT', body: JSON.stringify({ contact: data }) }
				);
				if (!success) {
					toastErrors(result.issues);
					throw new Error('Failed to update contact');
				}
			});
			await invalidate(`contact:${contact.id}`);
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
