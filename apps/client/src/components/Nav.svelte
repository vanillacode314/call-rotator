<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { isOnline } from '$/stores/online';
	import { cn } from '$/utils/ui';
	import { page } from '$app/stores';
	import { toggleMode } from 'mode-watcher';

	interface $$Props {
		class?: string;
	}
</script>

<div class={cn('border-offset-background full-width border-b bg-background py-4', $$props.class)}>
	<div class="flex items-center gap-4">
		<a href="/">
			<p class="font-bold uppercase tracking-wide">Call Rotator</p>
		</a>
		<div>
			<div
				class="i-mdi:cloud text-xl transition-all"
				class:scale-0={!$isOnline}
				class:scale-100={$isOnline}
			/>
			<div
				class="i-mdi:local absolute text-xl transition-all"
				class:scale-0={$isOnline}
				class:scale-100={!$isOnline}
			/>
		</div>
		<span class="grow" />
		<Button on:click={toggleMode} variant="outline" size="icon">
			<div
				class="i-radix-icons:sun rotate-0 scale-100 text-xl transition-all dark:-rotate-90 dark:scale-0"
			/>
			<div
				class="i-radix-icons:moon absolute rotate-90 scale-0 text-xl transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</div>
