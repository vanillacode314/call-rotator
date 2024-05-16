<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';

	const migrations = writable<string[] | null>(null);

	function showMigrateModal(_migrations: string[]) {
		migrations.set(_migrations);
	}

	export { showMigrateModal };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { getRawSQLocalClient, getSQLocalClient } from '$/lib/db/sqlocal.client';
	import { sql } from 'drizzle-orm';

	async function onsubmit() {
		const db = await getSQLocalClient();
		const dbx = await getRawSQLocalClient();
		const file = await dbx.getDatabaseFile();
		const blob = new Blob([file], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'database.sqlite3';
		a.click();
		for (const migration of $migrations ?? []) {
			await db.run(sql.raw(migration));
			await db.run(sql`INSERT INTO migrations (timestamp) VALUES ((datetime ('now')))`);
		}
		migrations.set(null);
	}
</script>

<Dialog.Root open={!!$migrations} onOpenChange={(value) => value || migrations.set(null)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>App Updated</Dialog.Title>
				<Dialog.Description>Please download the backup and continue.</Dialog.Description>
			</Dialog.Header>
			<div class="py-4"></div>
			<Dialog.Footer>
				<Button type="submit">Download Backup And Continue</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
