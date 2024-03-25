<script lang="ts" context="module">
	const text = writable<string>('');

	function showTextModal(value: string) {
		text.set(value);
	}

	export { showTextModal };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';
	import { writable } from '@square/svelte-store';
</script>

<Dialog.Root open={$text !== ''} onOpenChange={(value) => text.set(value ? $text : '')}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form on:submit|preventDefault={() => ($text = '')}>
			<span class="whitespace-pre-wrap">{$text}</span>
			<Dialog.Footer>
				<Button type="submit" class="mt-4">Close</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
