<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';
	export const createFileModalOpen = writable(false);
</script>

<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { Input } from '$/components/ui/input';
	import * as Select from '$/components/ui/select';
	import { mutations, query } from '$/lib/db/utils/nodes';
	import { parseFormData } from '$/utils';
	import { VALID_FILETYPES } from '$/consts';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';

	$: pwd = decodeURI($page.url.pathname);

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			const { name, filetype } = parseFormData(
				e.target as HTMLFormElement,
				z.object({ name: z.string(), filetype: z.string() })
			);
			await mutations.createNode({
				name: name + filetype,
				parent_id: (await query.getNodeByPath(pwd)).id,
				metadata: {}
			});
			invalidate(`pwd:${pwd}`);
		} finally {
			$createFileModalOpen = false;
		}
	}
</script>

<Dialog.Root bind:open={$createFileModalOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>Create a New File</Dialog.Title>
				<Dialog.Description>Click create when done.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-[2fr_1fr] items-center gap-4">
					<Input name="name" id="name" value="New List" />
					<Select.Root
						selected={{ value: VALID_FILETYPES[0], label: VALID_FILETYPES[0] }}
						items={VALID_FILETYPES.map((type) => ({ value: type, label: type }))}
					>
						<Select.Trigger>
							<Select.Value placeholder="Select a filetype" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Filetypes</Select.Label>
								{#each VALID_FILETYPES as type}
									<Select.Item value={type}>{type}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="filetype" />
					</Select.Root>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
