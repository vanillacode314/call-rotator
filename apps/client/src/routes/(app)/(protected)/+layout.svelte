<script lang="ts">
	import Nav from '$/components/Nav.svelte';
	import Fab from '$/components/Fab.svelte';
	import { initActionsContext } from '$/stores/actions';
	import Sidebar from '$/components/Sidebar.svelte';
	import { initClipboardContext } from '$/stores/clipboard';
	import { page } from '$app/stores';
	import { initTaskQueueContext } from '$/stores/task-queue';

	initActionsContext();
	initClipboardContext();
	initTaskQueueContext();

	const modals = import.meta.glob('$/components/modals/*Modal.svelte', {
		import: 'default',
		eager: true
	}) satisfies Record<string, ConstructorOfATypedSvelteComponent>;
</script>

{#each Object.values(modals) as comp}
	<svelte:component this={comp}></svelte:component>
{/each}
<div class="content-grid h-full grid-rows-[auto_1fr]">
	<Nav />
	<Fab class="fixed bottom-0 right-0 m-4 p-4 md:hidden" />
	<main class="full-width overflow-hidden">
		{#if $page.error}
			<slot />
		{:else}
			<div class="grid h-full gap-4 overflow-y-hidden bg-background p-0 md:grid-cols-[230px_1fr]">
				<div class="hidden md:contents">
					<Sidebar class="p-4" />
				</div>
				<!-- <img src="/phone.png" width="256" height="256" /> -->
				<slot />
			</div>
		{/if}
	</main>
</div>
