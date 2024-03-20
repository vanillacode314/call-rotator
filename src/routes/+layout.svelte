<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../app.pcss';
	import Nav from '$/components/Nav.svelte';
	import 'uno.css';
	import { initFileSystemContext } from '$/stores';
	import { onMount } from 'svelte';
	import { initDB } from '$/lib/db/schema';

	initFileSystemContext();

	const modals = import.meta.glob('$/components/modals/*.svelte', {
		import: 'default',
		eager: true
	}) satisfies Record<string, ConstructorOfATypedSvelteComponent>;

	onMount(() => {
		initDB();
	});
</script>

{#each Object.values(modals) as comp}
	<svelte:component this={comp}></svelte:component>
{/each}
<div class="content-grid h-full grid-rows-[auto_1fr]">
	<Nav />
	<main class="content-grid">
		<slot />
	</main>
</div>
<ModeWatcher />
