<script lang="ts">
	import { Input } from '$/components/ui/input';
	import { Label } from '$/components/ui/label';
	import { Textarea } from '$/components/ui/textarea';

	export let contact: TContact = { name: '', phone: '', notes: '' };

	function onInput(event: InputEvent) {
		const inp = event.target as HTMLInputElement;
		if (inp.validity.patternMismatch) {
			inp.setCustomValidity('Please enter a valid phone number.');
		} else {
			inp.setCustomValidity('');
		}
	}

	function validateInput(event: KeyboardEvent) {
		if (event.key.length === 1 && /[a-zA-z_]/.test(event.key)) {
			event.preventDefault();
		}
	}
</script>

<div class="grid gap-4 py-4">
	<div class="grid grid-cols-[1fr_3fr] items-center gap-4">
		<Label for="name" class="text-right">Name</Label>
		<Input required name="name" id="name" placeholder="John Doe" value={contact.name} />
		<Label for="phone" class="text-right">Phone</Label>
		<Input
			required
			name="phone"
			pattern="[0-9]{'{10}'}"
			maxlength={10}
			id="phone"
			placeholder={contact.phone === '__DISABLED__' ? 'Cannot change phone number' : '123567890'}
			value={contact.phone === '__DISABLED__' ? '' : contact.phone}
			on:keydown={validateInput}
			on:input={onInput}
			disabled={contact.phone === '__DISABLED__'}
		/>
		<Label for="phone" class="text-right">Notes</Label>
		<Textarea name="notes" id="notes" placeholder="Type your message here." value={contact.notes} />
	</div>
</div>
