<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../app.pcss';
	import Nav from '$/components/Nav.svelte';
	import 'uno.css';
	import { initSidebarContext } from '$/stores/sidebar';
	import { initFileSystemContext } from '$/stores/filesystem';
	import Sidebar from '$/components/Sidebar.svelte';
	import { initClipboardContext } from '$/stores/clipboard';
	import { Toaster } from '$/components/ui/sonner';

	initFileSystemContext();
	initSidebarContext();
	initClipboardContext();

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
	<main class="full-width">
		<div class="grid h-full gap-4 bg-background p-0 md:grid-cols-[200px_1fr]">
			<div class="hidden md:contents">
				<Sidebar class="p-4" />
			</div>
			<slot />
		</div>
	</main>
</div>
<Toaster richColors />
<ModeWatcher />
