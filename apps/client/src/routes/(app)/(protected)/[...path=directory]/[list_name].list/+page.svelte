<script lang="ts">
	import * as path from '$/utils/path';
	import { Input } from '$/components/ui/input';
	import { Label } from '$/components/ui/label';
	import { useActions } from '$/stores/actions';
	import { Button } from '$/components/ui/button';
	import PathCrumbs from '$/components/PathCrumbs.svelte';
	import * as Card from '$/components/ui/card';
	import { formatDate, safeParseFormData, toastErrors } from '$/utils';
	import { openContactPicker } from '$/components/modals/ContactPickerModal.svelte';
	import { invalidate } from '$app/navigation';
	import DataTableActions from './DataTableActions.svelte';
	import * as Table from '$/components/ui/table';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { readable } from '@square/svelte-store';
	import DatePicker from '$/components/DatePicker.svelte';
	import { parseDate } from '@internationalized/date';
	import { queueTask, useTaskQueue } from '$/stores/task-queue';
	import { listSchema } from 'schema/db';
	import { postListContactById } from 'db/queries/v1/lists/by-id/contacts/index';
	import { getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { DEFAULT_LOCAL_USER_ID } from '$/consts';
	import { putList } from 'db/queries/v1/lists/by-id/index';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { PostListContactByIdResponseV1Schema } from 'schema/routes/api/v1/lists/by-id/contacts';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { createFetcher } from '$/utils/zod';
	import { PutListByIdResponseV1Schema } from 'schema/routes/api/v1/lists/by-id';

	const { actions } = useActions();
	const queue = useTaskQueue();
	const fetcher = createFetcher(fetch, {
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});

	export let data;
	$: ({ pwd, list, contacts } = data);

	async function importContact() {
		const newContacts = await openContactPicker();
		if (!newContacts) return;
		if (newContacts.length < 1) return;
		queueTask(queue, 'Importing Contacts', async () => {
			const { result, success } = await fetcher(
				PostListContactByIdResponseV1Schema,
				PUBLIC_API_BASE_URL +
					`/api/v1/private/lists/by-id/contacts?id=${encodeURIComponent(list.id)}`,
				{ method: 'POST', body: JSON.stringify({ contactIds: newContacts.map((c) => c.id) }) }
			);
			if (!success) {
				toastErrors(result.issues);
				return;
			}
			await invalidate(`list:${pwd}`);
		});
	}

	$actions = [
		{
			label: 'Import Contacts',
			icon: 'i-mdi:person-add',
			onclick: importContact
		}
	];

	const formSchema = listSchema.pick({ startDate: true, cycleDurationDays: true }).extend({
		cycleDurationDays: z.coerce.number(),
		startDate: z.coerce.date()
	});
	async function onSave(event: SubmitEvent) {
		const form = event.target as HTMLFormElement;
		const result = safeParseFormData(form, formSchema);
		if (!result.success) {
			result.error.errors.forEach((err) => toast.error(err.message));
			return;
		}
		// await putList(db, DEFAULT_LOCAL_USER_ID, list.id, { list: Object.assign(list, result.data) });
		const { result: result2, success } = await fetcher(
			PutListByIdResponseV1Schema,
			PUBLIC_API_BASE_URL + `/api/v1/private/lists/by-id?id=${encodeURIComponent(list.id)}`,
			{ method: 'PUT', body: JSON.stringify({ list: Object.assign(list, result.data) }) }
		);
		if (!success) {
			toastErrors(result2.issues);
			return;
		}
		toast.success('Changes saved');
		await invalidate(`list:${pwd}`);
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
				const interval = Math.floor(list!.cycleDurationDays / contacts.length);
				const now = Date.now();
				const s = list!.startDate.getTime();
				const dt = Math.floor((now - s) / 1000 / 60 / 60 / 24);
				let retval: number;
				if (dt <= 0) {
					retval = index * interval + Math.abs(dt);
				} else {
					retval = index * interval - (Math.abs(dt) % list!.cycleDurationDays);
					if (retval < 0) retval += list!.cycleDurationDays;
				}
				return retval === 0 ? 'Today' : retval === 1 ? 'Tomorrow' : `${retval} days`;
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
				return createRender(DataTableActions, { contact: value, list });
			}
		})
	]);
	$: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns));
</script>

<svelte:head>
	<title>Call Rotator</title>
</svelte:head>

<div class="flex flex-col gap-4 py-4">
	<PathCrumbs path={pwd} />
	{#if list}
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
								value={list.cycleDurationDays}
								on:input={validateCycleDurationDays}
							/>
							<Label for="cycleDurationDays" class="text-right">Start Date</Label>
							<DatePicker
								class="w-full"
								name="startDate"
								id="startDate"
								value={parseDate(formatDate(list.startDate))}
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
