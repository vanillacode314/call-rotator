<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	import type { TContact } from 'schema/db';

	let pageNo = 1;
	let itemsPerPage = 10;
	const open = writable<boolean>(false);
	const contacts = writable<TContact[]>([]);
	let _resolve: (contacts: TContact[]) => void = () => {};
	let _reject: (contacts: TContact[]) => void = () => {};

	async function openContactPicker(selectedIds: TContact['id'][] = []) {
		const [rawDb, db] = await getSQLocalClient();
		const allContacts = await getContacts(db, DEFAULT_LOCAL_USER_ID, {
			page: pageNo,
			itemsPerPage
		});
		console.log(allContacts);
		open.set(true);
		contacts.set(allContacts.contacts);
		return new Promise<TContact[]>((resolve, reject) => {
			_resolve = resolve;
			_reject = reject;
		});
	}

	export { openContactPicker };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { Checkbox } from '$/components/ui/checkbox';
	import { Label } from '$/components/ui/label';
	import { getContacts } from 'db/queries/v1/contacts/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';

	let selected: boolean[] = [];
	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const selectedContacts = $contacts.filter((_, index) => selected[index]);
		_resolve(selectedContacts);
		$open = false;
		$contacts = [];
		selected = [];
	}
</script>

<Dialog.Root bind:open={$open}>
	<Dialog.Content class="max-w-[75%]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>Pick Contacts</Dialog.Title>
				<Dialog.Description>Click confirm when done.</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-4 py-4">
				<div class="grid h-full gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{#each $contacts as contact, index}
						<Label class="flex items-center justify-start gap-2">
							<Checkbox bind:checked={selected[index]} />
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
