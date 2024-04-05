<script lang="ts">
	import * as path from '$/utils/path';
	import { Input } from '$/components/ui/input';
	import { Label } from '$/components/ui/label';
	import { useActions } from '$/stores/actions';
	import { parseMetadata } from '$/utils/types';
	import { Button } from '$/components/ui/button';
	import PathCrumbs from '$/components/PathCrumbs.svelte';
	import * as Card from '$/components/ui/card';
	import { listMetadataSchema } from '$/types/list';
	import { formatDate, safeParseFormData } from '$/utils';
	import { z } from 'zod';
	import { mutations } from '$/lib/db/utils/nodes';
	import { toast } from 'svelte-sonner';
	import { openFilePicker } from '$/components/modals/FilePickerModal.svelte';
	import { openContactPicker } from '$/components/modals/ContactPickerModal.svelte';
	import { invalidate } from '$app/navigation';
	import DataTableActions from './DataTableActions.svelte';
	import * as Table from '$/components/ui/table';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { readable } from '@square/svelte-store';
	import DatePicker from '$/components/DatePicker.svelte';
	import { parseDate } from '@internationalized/date';

	const { actions } = useActions();

	export let data;
	$: ({ pwd } = data);

	async function importContact() {
		openFilePicker((contactFile) => {
			if (contactFile === null) {
				toast.error('No file selected');
				return;
			}
			openContactPicker(contactFile.id, async (selectedContacts) => {
				await mutations.updateMetadata(node!.id, (metadata) => {
					const parsedMetadata = listMetadataSchema.parse(metadata);
					const contactIds = parsedMetadata.contacts[contactFile.id];
					if (contactIds === undefined) {
						parsedMetadata.contacts[contactFile.id] = selectedContacts.map((c) => c.phone);
						return parsedMetadata;
					}
					parsedMetadata.contacts[contactFile.id] = [
						...contactIds,
						...selectedContacts.map((c) => c.phone)
					];
					return parsedMetadata;
				});
				invalidate(`list:${node!.id}`);
			});
		}, '%.contacts');
	}

	$actions = [
		{
			label: 'Import Contacts',
			icon: 'i-mdi:person-add',
			onclick: importContact
		}
	];

	$: node = data.node ? parseMetadata(data.node, listMetadataSchema) : data.node;

	const formSchema = listMetadataSchema.pick({ startDate: true }).extend({
		cycleDurationDays: z.coerce.number().int().min(1)
	});
	async function onSave(event: SubmitEvent) {
		event.preventDefault();
		const result = safeParseFormData(event.target as HTMLFormElement, formSchema);
		if (!result.success) {
			result.error.issues.forEach((issue) => {
				toast.error(issue.message);
			});
			return;
		}
		const parsedFormData = result.data;
		await mutations
			.updateMetadata(node!.id, (metadata) => {
				return Object.assign(metadata ?? {}, parsedFormData);
			})
			.then(() => {
				toast.success('Saved successfully!');
				invalidate(`list:${node!.id}`);
			})
			.catch((e) => {
				console.error(e);
				toast.error('Failed to save');
			});
	}

	function validateCycleDurationDays(event: Event) {
		const inp = event.target as HTMLInputElement;
		if (inp.validity.rangeUnderflow) {
			inp.setCustomValidity('Cycle duration must be greater than number of contacts');
		} else {
			inp.setCustomValidity('');
		}
	}

	$: table = createTable(readable(data.contacts ?? []));
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
			accessor: (contact) => contact,
			header: 'Due In',
			cell: ({ value }) => {
				const contacts = data.contacts!;
				const index = contacts?.indexOf(value);
				const interval = Math.floor(node!.metadata.cycleDurationDays / contacts.length);
				const now = Date.now();
				const s = node!.metadata.startDate.getTime();
				const dt = Math.floor((now - s) / 1000 / 60 / 60 / 24);
				let retval: number;
				if (dt < 0) {
					retval = index * interval + Math.abs(dt);
				} else {
					retval =
						index * interval +
						(node!.metadata.cycleDurationDays - (Math.abs(dt) % node!.metadata.cycleDurationDays));
				}
				return `${retval} ${retval === 1 ? 'day' : 'days'}`;
			}
		}),
		table.column({
			accessor: 'notes',
			header: 'Notes'
		}),
		table.column({
			accessor: (contact) => contact,
			header: '',
			cell: ({ value }) => {
				return createRender(DataTableActions, { contact: value, nodeId: node!.id });
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
		{#if data.contacts?.length ?? 0 > 0}
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
								min={data.contacts?.length ?? 1}
								required
								name="cycleDurationDays"
								id="cycleDurationDays"
								value={node.metadata.cycleDurationDays}
								on:input={validateCycleDurationDays}
							/>
							<Label for="cycleDurationDays" class="text-right">Start Date</Label>
							<DatePicker
								class="w-full"
								name="startDate"
								id="startDate"
								value={parseDate(formatDate(node.metadata.startDate))}
							/>
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-end">
						<Button type="submit">Save</Button>
					</Card.Footer>
				</Card.Root>
			</form>
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
		{:else}
			<div
				class="col-span-full grid h-full place-content-center place-items-center gap-4 text-3xl font-bold uppercase tracking-wide"
			>
				<div class="i-nimbus:box-unpacked text-5xl"></div>
				<span>No contacts</span>
				<div class="flex flex-col items-center gap-4 md:flex-row">
					<Button size="lg" on:click={() => importContact()}>Import Contacts</Button>
				</div>
			</div>
		{/if}
	{:else}
		<div class="grid place-content-center p-8">
			<div class="i-mdi:loading animate-spin text-7xl"></div>
		</div>
	{/if}
</div>
