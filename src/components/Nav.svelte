<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { cn } from '$/utils/ui';
	import { toggleMode } from 'mode-watcher';

	interface $$Props {
		class?: string;
	}
</script>

<div
	class={cn('border-offset-background full-width border-b bg-background !px-6 py-4', $$props.class)}
>
	<div class="flex items-center gap-4">
		<p class="font-bold uppercase tracking-wide">Call Rotator</p>
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
