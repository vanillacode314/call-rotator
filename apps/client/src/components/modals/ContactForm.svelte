<script lang="ts">
	import { Input } from '$/components/ui/input';
	import { Label } from '$/components/ui/label';
	import { Textarea } from '$/components/ui/textarea';
	import type { TContact } from 'schema/db';

	export let contact: Omit<TContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'> &
		Partial<Pick<TContact, 'id'>> = {
		name: '',
		phone: '',
		notes: '',
		tags: []
	};

	function onInput(event: InputEvent) {
		const inp = event.target as HTMLInputElement;
		if (inp.validity.patternMismatch) {
			inp.setCustomValidity('Please enter a valid phone number.');
		} else {
			inp.setCustomValidity('');
		}
	}

	function validateInput(event: KeyboardEvent) {
		if (!event.key) return;
		if (event.key.length === 1 && /[a-zA-z_]/.test(event.key)) {
			event.preventDefault();
		}
	}
</script>

<div class="grid gap-4 py-4">
	<div class="grid grid-cols-[1fr_3fr] items-center gap-4">
		{#if contact.id}
			<input type="hidden" name="id" id="id" value={contact.id} />
		{/if}
		<Label for="name" class="text-right">Name</Label>
		<Input required name="name" id="name" placeholder="John Doe" value={contact.name} />
		<Label for="phone" class="text-right">Phone</Label>
		<Input
			required
			name="phone"
			pattern="[0-9]{'{10}'}"
			maxlength={10}
			id="phone"
			placeholder="123567890"
			value={contact.phone}
			on:keydown={validateInput}
			on:input={onInput}
		/>
		<Label for="phone" class="text-right">Notes</Label>
		<Textarea name="notes" id="notes" placeholder="Type your message here." value={contact.notes} />
	</div>
</div>
