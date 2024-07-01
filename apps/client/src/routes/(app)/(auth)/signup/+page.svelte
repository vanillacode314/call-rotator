<script lang="ts">
	import { Toggle } from '$/components/ui/toggle/index.js';
	import { Button } from '$/components/ui/button/index.js';
	import * as Card from '$/components/ui/card/index.js';
	import { Input } from '$/components/ui/input/index.js';
	import { Label } from '$/components/ui/label/index.js';
	import { toastErrors } from '$/utils';
	import { SignUpResponseV1Schema } from 'schema/routes/api/v1/signup';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { getSQLocalClient, seed } from '$/lib/db/sqlocal.client';
	import { jwtDecode } from 'jwt-decode';

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const response = SignUpResponseV1Schema.parse(
			await fetch(PUBLIC_API_BASE_URL + '/api/v1/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(Object.fromEntries(formData)),
				redirect: 'manual'
			}).then((res) => res.json())
		);
		if (!response.success) {
			toastErrors(response.result.issues);
			return;
		}
		const { token } = response.result;
		const user = jwtDecode(token) as TUser;
		token && localStorage.setItem('jwtToken', token);
		window.location.reload();
	}

	let passwordVisible: boolean = false;
</script>

<form
	class="grid h-full place-content-center"
	on:submit={onSubmit}
	action="/api/v1/signup"
	method="POST"
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Sign Up</Card.Title>
			<Card.Description>Enter your details below to signup for a new account.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
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
			<Button type="submit" class="w-full">Sign up</Button>
			<Button variant="ghost" href="/signin" class="col-span-2">Sign In Instead</Button>
		</Card.Footer>
	</Card.Root>
</form>
