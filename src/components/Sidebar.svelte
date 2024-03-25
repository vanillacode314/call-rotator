<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { useSidebar } from '$/stores/sidebar';
	import { cn } from '$/utils/ui';

	const { actions } = useSidebar();
	interface $$Props {
		class?: string;
	}
</script>

<div class={cn('border-offset-background flex flex-col gap-2 border-r', $$props.class)}>
	{#each $actions as action}
		<Button
			class="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-wider"
			on:click={action.onclick}
			variant="ghost"
			type="button"
		>
			<span>{action.label}</span>
			<span class={cn(action.icon, 'text-base')}></span>
		</Button>
	{/each}
</div>
