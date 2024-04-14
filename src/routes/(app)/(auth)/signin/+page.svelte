<script lang="ts">
	import { Button } from '$/components/ui/button/index.js';
	import * as Card from '$/components/ui/card/index.js';
	import { Input } from '$/components/ui/input/index.js';
	import { Label } from '$/components/ui/label/index.js';
	import { createZodFetcher } from 'zod-fetch';
	import { responseSchema as signInResponseSchema } from '$/routes/api/v1/signin/schema';
	import { toastErrors } from '$/utils';
	import { Toggle } from '$/components/ui/toggle';

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const response = await fetch('/api/v1/signin', {
			method: 'POST',
			body: formData
		});
		if (response.redirected) {
			window.location.href = response.url;
		}
		if (!response.ok) {
			const result = signInResponseSchema.parse(await response.json());
			toastErrors(result.errors);
			return;
		}
	}

	let passwordVisible: boolean = false;
</script>

<form
	class="grid h-full place-content-center"
	on:submit={onSubmit}
	action="/api/v1/signin"
	method="POST"
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Sign In</Card.Title>
			<Card.Description>Enter your email below to login to your account.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					name="email"
					placeholder="m@example.com"
					required
					autocomplete="username"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<div class="flex gap-2">
					<Input
						name="password"
						id="password"
						type={passwordVisible ? 'text' : 'password'}
						required
						autocomplete="current-password"
					/>
					<Toggle
						aria-label="toggle password"
						onPressedChange={(value) => (passwordVisible = value)}
					>
						<span class="i-mdi:eye"></span>
					</Toggle>
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="grid gap-4 sm:grid-cols-2">
			<Button
				type="button"
				class="w-full"
				variant="secondary"
				on:click={() => {
					document.cookie = 'mode=offline';
					location.reload();
				}}>Go Offline</Button
			>
			<Button type="submit" class="w-full">Sign in</Button>
			<Button variant="ghost" href="/signup" class="col-span-2">Sign Up Instead</Button>
		</Card.Footer>
	</Card.Root>
</form>
