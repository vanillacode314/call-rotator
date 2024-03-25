<script lang="ts" context="module">
	import { writable } from '@square/svelte-store';

	type TAlert = {
		title: string;
		message: string;
		icon?: string;
		onYes?: () => void;
		onNo?: () => void;
	};
	const alertData = writable<TAlert | null>(null);

	function alert(
		title: string,
		message: string,
		{ icon, onYes = () => {}, onNo = () => {} }: Pick<TAlert, 'icon' | 'onYes' | 'onNo'> = {}
	) {
		alertData.set({ title, message, icon, onYes, onNo });
	}

	export { alert };
</script>

<script lang="ts">
	import { Button } from '$/components/ui/button';
	import * as Dialog from '$/components/ui/dialog';

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		$alertData = null;
	}
</script>

<Dialog.Root open={!!$alertData} onOpenChange={(value) => value || alertData.set(null)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form on:submit={onsubmit}>
			<Dialog.Header>
				<Dialog.Title>{$alertData?.title}</Dialog.Title>
				<Dialog.Description>{$alertData?.message}</Dialog.Description>
			</Dialog.Header>
			<div class="py-4"></div>
			<Dialog.Footer>
				<Button type="submit" variant="ghost" on:click={$alertData?.onNo}>No</Button>
				<Button type="submit" on:click={$alertData?.onYes}>Yes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
