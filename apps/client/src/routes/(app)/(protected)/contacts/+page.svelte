<script lang="ts">
	import * as path from '$/utils/path';
	import { useActions } from '$/stores/actions';
	import { Button } from '$/components/ui/button';
	import PathCrumbs from '$/components/PathCrumbs.svelte';
	import DataTableActions from './DataTableActions.svelte';
	import * as Table from '$/components/ui/table';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { readable } from '@square/svelte-store';
	import { createFetcher } from '$/utils/zod';
	import { useTaskQueue } from '$/stores/task-queue';
	import { newContactModalOpen } from '$/components/modals/CreateContactModal.svelte';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import * as Pagination from '$/components/ui/pagination/index.js';
	import { goto } from '$app/navigation';

	const { actions } = useActions();
	const queue = useTaskQueue();

	export let data;
	$: ({ contacts, total, itemsPerPage, page } = data);

	function createContact() {
		$newContactModalOpen = true;
	}

	$actions = [
		{
			label: 'Create Contact',
			icon: 'i-mdi:person-add',
			onclick: createContact
		}
	];

	$: table = createTable(readable(contacts));
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
				return createRender(DataTableActions, { contact: value });
			}
		})
	]);
	$: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns));
</script>

<svelte:head>
	<title>Contacts - Call Rotator</title>
</svelte:head>

<div class="flex flex-col gap-4 overflow-y-auto py-4">
	<PathCrumbs path="/contacts" />
	{#if data.contacts?.length ?? 0 > 0}
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
											{:else if cell.id === 'phone'}
												<span class="hidden sm:table-cell">
													<Render of={cell.render()} />
												</span>
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
											{:else if cell.id === 'phone'}
												<span class="hidden sm:table-cell">
													<Render of={cell.render()} />
												</span>
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
		<Pagination.Root
			count={total}
			perPage={itemsPerPage}
			let:pages
			let:currentPage
			onPageChange={(value) => {
				const url = new URL(window.location.href);
				url.searchParams.set('page', String(value));
				goto(url);
			}}
		>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton>
						<ChevronLeft class="h-4 w-4" />
						<span class="hidden sm:block">Previous</span>
					</Pagination.PrevButton>
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage === page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton>
						<span class="hidden sm:block">Next</span>
						<ChevronRight class="h-4 w-4" />
					</Pagination.NextButton>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	{:else}
		<div
			class="col-span-full grid h-full place-content-center place-items-center gap-4 text-3xl font-bold uppercase tracking-wide"
		>
			<div class="i-nimbus:box-unpacked text-5xl"></div>
			<span>No contacts</span>
			<div class="flex flex-col items-center gap-4 md:flex-row">
				<Button size="lg" on:click={() => createContact()}>Create Contact</Button>
			</div>
		</div>
	{/if}
</div>
