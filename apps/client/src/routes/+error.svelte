<script>
	import { ModeWatcher } from 'mode-watcher';
	import Button from '$/components/ui/button/button.svelte';
	import Nav from '$/components/Nav.svelte';
	import { page } from '$app/stores';
	import { resetDb } from '$/lib/db/sqlocal.db';
	import { isOnline } from '$/stores/online';
</script>

<div class="content-grid h-full grid-rows-[auto_1fr]">
	<Nav />
	<main class="full-width">
		<div class="grid place-content-center text-center">
			<h1 class="flex flex-col gap-4">
				{#if $isOnline}
					<span class="text-lg">
						{$page.status} : {$page.error?.message ?? 'Unknown Error'}
					</span>
					<Button href="/" size="lg" class="flex h-14 gap-2 text-xl">
						<span class="i-carbon:home"></span>
						Home
					</Button>
				{:else}
					<span class="text-lg"> You are offline </span>
				{/if}
			</h1>
		</div>
	</main>
</div>
<ModeWatcher />
