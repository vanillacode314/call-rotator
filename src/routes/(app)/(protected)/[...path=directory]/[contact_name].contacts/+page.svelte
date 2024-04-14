<script lang="ts">
	import * as path from '$/utils/path';
	import { useFileSystem } from '$/stores/filesystem';
	import { useActions } from '$/stores/actions';
	import { newContactModalOpen } from '$/components/modals/NewContactModal.svelte';
	import { parseMetadata } from '$/utils/types';
	import { contactMetadataSchema } from '$/types/contact';
	import { readable } from '@square/svelte-store';
	import * as Table from '$/components/ui/table';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import DataTableActions from './DataTableActions.svelte';
	import { Button } from '$/components/ui/button';
	import PathCrumbs from '$/components/PathCrumbs.svelte';
	import { mutations as nodesMutations } from '$/lib/db/utils/nodes';
	import { alert } from '$/components/modals/AlertModal.svelte';
	import { invalidate } from '$app/navigation';

	const { selectedNode } = useFileSystem();
	const { actions } = useActions();

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
		},
		{
			label: 'Delete Contact',
			icon: 'i-carbon:trash-can',
			async onclick() {
				alert('Delete File', 'Are you sure you want to delete this file?', {
					icon: 'i-carbon:trash-can',
					onYes: () => nodesMutations.removeNode(node!.id).then(() => invalidate(`pwd:${pwd}`))
				});
			}
		}
	];

	$: node = data.node ? parseMetadata(data.node, contactMetadataSchema) : data.node;
	$: table = createTable(readable(node ? node.metadata.contacts : []));
	$: columns = table.createColumns([
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: 'phone',
			header: 'Phone'
		}),
		table.column({
			accessor: 'notes',
			header: 'Notes'
		}),
		table.column({
			accessor: (contact) => contact,
			header: '',
			cell: ({ value }) => {
				return createRender(DataTableActions, { contact: value, node: node! });
			}
		})
	]);
	$: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns));
</script>

<svelte:head>
	<title>{path.compressPath(pwd)}</title>
</svelte:head>

<div class="flex flex-col gap-4 py-4">
	<PathCrumbs path={pwd} />
	{#if node}
		{#if node.metadata.contacts.length > 0}
			<div class="w-full self-start rounded-md border">
				<Table.Root {...$tableAttrs}>
					<Table.Header>
						{#each $headerRows as headerRow}
							<Subscribe rowAttrs={headerRow.attrs()}>
								<Table.Row>
									{#each headerRow.cells as cell (cell.id)}
										<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
											<Table.Head {...attrs}>
												{#if cell.id === 'notes'}
													<span
														class="line-clamp-1 hidden truncate whitespace-pre-line text-muted-foreground group-hover:line-clamp-none sm:table-cell"
														><Render of={cell.render()} /></span
													>
												{:else}
													<Render of={cell.render()} />
												{/if}
											</Table.Head>
										</Subscribe>
									{/each}
								</Table.Row>
							</Subscribe>
						{/each}
					</Table.Header>
					<Table.Body {...$tableBodyAttrs}>
						{#each $pageRows as row (row.id)}
							<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
								<Table.Row {...rowAttrs} class="group">
									{#each row.cells as cell (cell.id)}
										<Subscribe attrs={cell.attrs()} let:attrs>
											<Table.Cell {...attrs}>
												{#if cell.id === ''}
													<div class="text-right">
														<Render of={cell.render()} />
													</div>
												{:else if cell.id === 'notes'}
													<span
														class="sm:box line-clamp-1 hidden truncate whitespace-pre-wrap text-muted-foreground"
														><Render of={cell.render()} /></span
													>
												{:else}
													<Render of={cell.render()} />
												{/if}
											</Table.Cell>
										</Subscribe>
									{/each}
								</Table.Row>
							</Subscribe>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<div
				class="grid h-full place-content-center place-items-center gap-4 text-3xl font-bold uppercase tracking-wide"
			>
				<div class="i-nimbus:box-unpacked text-5xl"></div>
				<span>No contacts</span>
				<div class="flex flex-col items-center gap-4 md:flex-row">
					<Button
						size="lg"
						on:click={() => {
							if (data.node) $selectedNode = data.node;
							$newContactModalOpen = true;
						}}>New Contact</Button
					>
				</div>
			</div>
		{/if}
	{:else}
		<div class="grid place-content-center p-8">
			<div class="i-mdi:loading animate-spin text-7xl"></div>
		</div>
	{/if}
</div>
