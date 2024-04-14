<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { useActions } from '$/stores/actions';
	import { cn } from '$/utils/ui';
	import { Label } from '$/components/ui/label/index.js';
	import { Switch } from '$/components/ui/switch/index.js';
	import { page } from '$app/stores';
	import { useTaskQueue } from '$/stores/task-queue';

	const { actions } = useActions();
	const { items } = useTaskQueue();
	interface $$Props {
		class?: string;
	}
</script>

<div class={cn('border-offset-background flex flex-col gap-8 border-r', $$props.class)}>
	<div class="border-offset-background flex flex-col gap-2">
		{#each $actions as action}
			<Button
				class="flex items-center justify-end gap-2 self-end text-xs font-bold uppercase tracking-wider"
				on:click={action.onclick}
				variant="ghost"
				type="button"
			>
				<span>{action.label}</span>
				<span class={cn(action.icon, 'shrink-0 text-base')}></span>
			</Button>
		{/each}
	</div>
	<span class="grow" />
	<ul class="flex justify-end">
		{#each $items as item}
			<li class="flex items-center gap-4">
				<span class="text-xs font-bold uppercase tracking-wider">
					{item.title}
				</span>
				<span class="i-mdi:loading animate-spin" />
			</li>
		{/each}
	</ul>
	<div class="flex items-center justify-end space-x-2">
		<Label class="text-xs uppercase tracking-wider" for="toggle-offline-mode">Offline</Label>
		<Switch
			id="toggle-offline-mode"
			checked={$page.data.mode === 'online'}
			onCheckedChange={(value) => {
				document.cookie = `mode=${value ? 'online' : 'offline'}; path=/;`;
				window.location.reload();
			}}
		/>
		<Label class="text-xs uppercase tracking-wider" for="toggle-offline-mode">Online</Label>
	</div>
</div>
