<script lang="ts" context="module">
	import { page } from '$app/stores';
	import { getOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { writable, get } from '@square/svelte-store';
	import { createFetcher } from '$/utils/zod';
	import type { TList, TContact } from 'schema/db';

	let pageNo = 1;
	let itemsPerPage = 10;
	const open = writable<boolean>(false);
	const _list = writable<TList | null>(null);
	const _contacts = writable<TContact[]>([]);
	let _resolve: (contacts: TContact[]) => void = () => {};
	let _reject: (contacts: TContact[]) => void = () => {};

	async function openContactPicker(list: TList, contacts: TContact[]) {
		const db = await getSQLocalClient();
		const allContacts = await getContacts(db, get(page).data.user.id, {
			page: pageNo,
			itemsPerPage
		});
		console.log(allContacts);
		open.set(true);
		_list.set(list);
		_contacts.set(contacts);
		return new Promise<TContact[]>((_resolve, _reject) => {
			_resolve = _resolve;
			_reject = _reject;
		});
	}

	export { openContactPicker };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { parseMetadata } from '$/utils/types';
	import { Checkbox } from '$/components/ui/checkbox';
	import { Label } from '$/components/ui/label';
	import { toastErrors } from '$/utils';
	import { getContacts } from 'db/queries/v1/contacts/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';

	let selected: boolean[] = [];
	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		$open = false;
		$_list = null;
		$_contacts = [];
		_resolve([]);
		selected = [];
	}
</script>

<Dialog.Root bind:open={$open}>
	<Dialog.Content class="max-w-[75%]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>Pick a Contact</Dialog.Title>
				<Dialog.Description>Click confirm when done.</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-4 py-4">
				<div class="grid h-full gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{#each $_contacts as contact, index}
						<Label class="flex items-center justify-start gap-2">
							<Checkbox id="terms" aria-labelledby="terms-label" bind:checked={selected[index]} />
							<span class="truncate">{contact.name}</span>
						</Label>
					{/each}
				</div>
				<Dialog.Footer>
					<Button type="submit">Confirm</Button>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
