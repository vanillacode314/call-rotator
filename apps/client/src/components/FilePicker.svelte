<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as path from '$/utils/path';

	export let pwd: string, folders: TNode[], files: TNode[];
	$: isEmpty = folders.length + files.length === 0;
</script>

<div class="flex flex-col gap-4 py-4">
	{#if isEmpty}
		<div
			class="col-span-full grid h-full place-content-center place-items-center gap-4 text-3xl font-bold uppercase tracking-wide"
		>
			<div class="i-nimbus:box-unpacked text-5xl"></div>
			<span>No files</span>
		</div>
	{:else}
		<ul
			class="grid h-full content-start items-start gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
		>
			{#each folders as folder}
				<li class="grid">
					<Button
						draggable="true"
						variant="secondary"
						class="flex items-center justify-start gap-2"
						on:click={() => (pwd = path.join(pwd, folder.name))}
					>
						<span class="i-carbon:folder"></span>
						<span class="truncate">{folder.name}</span>
					</Button>
				</li>
			{/each}
			{#each files as file}
				<li class="grid">
					<Button
						variant="secondary"
						class="flex items-center justify-start gap-2"
						on:click={() => (pwd = path.join(pwd, file.name))}
					>
						<span class="i-carbon:document"></span>
						<span class="truncate">{file.name}</span>
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
