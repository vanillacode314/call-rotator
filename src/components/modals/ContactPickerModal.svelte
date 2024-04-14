<script lang="ts" context="module">
	import { getOutputSchema } from '$/routes/api/v1/(protected)/nodes/by-id/schema';
	import { writable } from '@square/svelte-store';
	import { createFetcher } from '$/utils/zod';

	const node = writable<(TNode & { metadata: { contacts: TContact[] } }) | null>(null);
	let _resolve: (contacts: TContact[]) => void = () => {};
	let _reject: (contacts: TContact[]) => void = () => {};

	const fetcher = createFetcher(fetch);

	async function openContactPicker(nodeId: TNode['id']) {
		let _node: TNode;
		if (get(page).data.mode === 'offline') {
			_node = await query.getNodeById(nodeId);
		} else {
			const result = await fetcher(getOutputSchema, `/api/v1/nodes/by-id?id=${nodeId}`);
			if (!result.success) {
				toastErrors(result.errors);
				return;
			}
			_node = result.data.node;
		}
		if (!_node.name.endsWith('.contacts')) {
			throw new Error('Invalid File');
		}
		_node = parseMetadata(_node, contactMetadataSchema);
		node.set(_node);
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
	import { query } from '$/lib/db/utils/nodes';
	import { contactMetadataSchema } from '$/types/contact';
	import { parseMetadata } from '$/utils/types';
	import { Checkbox } from '$/components/ui/checkbox';
	import { Label } from '$/components/ui/label';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { toastErrors } from '$/utils';

	let selected: boolean[] = [];
	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		_resolve($node!.metadata.contacts.filter((_, index) => selected[index]));
		node.set(null);
		selected = [];
	}
</script>

<Dialog.Root open={!!$node} onOpenChange={(value) => (value ? null : node.set(null))}>
	<Dialog.Content class="max-w-[75%]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>Pick a Contact</Dialog.Title>
				<Dialog.Description>Click confirm when done.</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-4 py-4">
				<div class="grid h-full gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{#each $node?.metadata.contacts ?? [] as contact, index}
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
