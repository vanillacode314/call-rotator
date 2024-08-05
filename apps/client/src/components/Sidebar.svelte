<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { useActions } from '$/stores/actions';
	import { cn } from '$/utils/ui';
	import { useTaskQueue } from '$/stores/task-queue';
	import { resetDb } from '$/lib/db/sqlocal.db';

	const { actions } = useActions();
	const { items } = useTaskQueue();
	interface $$Props {
		class?: string;
	}

	async function signout() {
		localStorage.removeItem('jwtToken');
		resetDb('database.sqlite3');
		window.location.reload();
	}
</script>

<div class={cn('border-offset-background flex flex-col gap-8 border-r', $$props.class)}>
	<div class="border-offset-background flex flex-col gap-2">
		{#each $actions as action}
			<Button
				class="flex items-end justify-start gap-2"
				on:click={action.onclick}
				variant="ghost"
				type="button"
			>
				<span class={cn(action.icon, 'shrink-0 text-2xl')}></span>
				<span>{action.label}</span>
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
	<div class="border-offset-background flex flex-col gap-2">
		<Button
			class="flex items-center justify-end gap-2 self-end font-bold"
			on:click={signout}
			variant="ghost"
			type="button"
		>
			<span>Sign Out</span>
			<span class="i-heroicons:arrow-right-end-on-rectangle shrink-0 text-3xl"></span>
		</Button>
	</div>
</div>
