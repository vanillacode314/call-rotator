<script lang="ts">
	import { Button } from '$/components/ui/button';
	import { useActions } from '$/stores/actions';
	import { cn } from '$/utils/ui';
	import * as Popover from '$/components/ui/popover';

	const { actions } = useActions();
	let open: boolean = false;

	interface $$Props {
		class?: string;
	}
</script>

<Popover.Root portal={null} bind:open>
	<Popover.Trigger asChild let:builder>
		<div class={cn($$props.class)}>
			<Button builders={[builder]} variant="outline" size="icon" class="size-14">
				<span
					class={cn(
						'i-carbon:add text-3xl transition-transform duration-300',
						open && 'rotate-[135deg]'
					)}
				></span>
			</Button>
		</div>
	</Popover.Trigger>
	<Popover.Content class="w-auto border-none p-0 pb-4">
		<ul class="grid gap-4">
			{#each $actions as action}
				<li>
					<Button
						on:click={() => {
							action.onclick();
							open = false;
						}}
						variant="outline"
						size="icon"
					>
						<span class="{action.icon} text-lg"></span>
					</Button>
				</li>
			{/each}
		</ul>
	</Popover.Content>
</Popover.Root>
