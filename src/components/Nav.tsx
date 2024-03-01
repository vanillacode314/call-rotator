import { DarkModeToggle } from '~/components/DarkModeToggle'

export function Nav() {
	return (
		<div class="bg-background container mx-auto flex gap-4 items-center !px-6 py-4 border-b border-offset-background">
			<p class="uppercase font-bold tracking-wide">Call Rotator</p>
			<span class="grow" />
			<DarkModeToggle />
		</div>
	)
}
