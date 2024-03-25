<script lang="ts">
	import * as path from '$/utils/path';
	import { Input } from '$/components/ui/input';
	import { Label } from '$/components/ui/label';
	import { useFileSystem } from '$/stores/filesystem';
	import { useSidebar } from '$/stores/sidebar';
	import { newContactModalOpen } from '$/components/modals/NewContactModal.svelte';
	import { parseMetadata } from '$/utils/types';
	import { Button } from '$/components/ui/button';
	import PathCrumbs from '$/components/PathCrumbs.svelte';
	import * as Card from '$/components/ui/card';
	import { listMetadataSchema } from '$/types/list';
	import { parseFormData } from '$/utils';
	import { z } from 'zod';
	import { mutations } from '$/lib/db/utils/nodes';
	import { toast } from 'svelte-sonner';

	const { selectedNode } = useFileSystem();
	const { actions } = useSidebar();

	export let data;
	$: ({ pwd } = data);

	$actions = [
		{
			label: 'New Contact',
			icon: 'i-mdi:person-add',
			async onclick() {
				$selectedNode = data.node!;
				$newContactModalOpen = true;
			}
		}
	];

	$: node = data.node ? parseMetadata(data.node, listMetadataSchema) : data.node;

	async function onSave(event: SubmitEvent) {
		event.preventDefault();
		const { cycleDurationDays } = parseFormData(
			event.target as HTMLFormElement,
			z.object({ cycleDurationDays: z.coerce.number().int().min(1) })
		);
		await mutations
			.updateMetadata(node!.id, (metadata) => {
				return Object.assign(metadata ?? {}, { cycleDurationDays });
			})
			.then(() => toast.success('Saved successfully!'))
			.catch((e) => {
				console.error(e);
				toast.error('Failed to save');
			});
	}
</script>

<svelte:head>
	<title>{path.compressPath(pwd)}</title>
</svelte:head>

<div class="flex flex-col gap-4 py-4">
	<PathCrumbs path={pwd} />
	{#if node}
		<form class="contents" on:submit={onSave}>
			<Card.Root>
				<Card.Header>
					<Card.Title>Dashboard</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid items-center justify-items-start gap-4 sm:grid-cols-[auto_1fr]">
						<Label for="cycleDurationDays" class="text-right">Cycle Duration Days</Label>
						<Input
							step={1}
							type="number"
							min={1}
							required
							name="cycleDurationDays"
							id="cycleDurationDays"
							value={node.metadata.cycleDurationDays}
						/>
					</div>
				</Card.Content>
				<Card.Footer class="flex justify-end">
					<Button type="submit">Save</Button>
				</Card.Footer>
			</Card.Root>
		</form>
	{:else}
		<div class="grid place-content-center p-8">
			<div class="i-mdi:loading animate-spin text-7xl"></div>
		</div>
	{/if}
</div>
