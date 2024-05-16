<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$/utils/ui.js';
	import { Button } from '$/components/ui/button/index.js';
	import { Calendar } from '$/components/ui/calendar/index.js';
	import * as Popover from '$/components/ui/popover/index.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type $$Props = { class?: string; value?: DateValue } & HTMLInputAttributes;

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	export let value: DateValue | undefined = undefined;
	let className: string = '';
	export { className as class };
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn(
				'justify-start text-left font-normal',
				!value && 'text-muted-foreground',
				className
			)}
			builders={[builder]}
		>
			<CalendarIcon class="mr-2 h-4 w-4" />
			{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
		</Button>
		<input
			type="hidden"
			value={value ? `${value.year}-${value.month}-${value.day}` : ''}
			{...$$restProps}
		/>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value initialFocus />
	</Popover.Content>
</Popover.Root>
