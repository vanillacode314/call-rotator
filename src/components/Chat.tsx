import { makePersisted } from '@solid-primitives/storage'
import { Show, createEffect, createSignal, getOwner } from 'solid-js'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { callFunctions, getFunctions } from '~/utils/ai'
import { Textarea } from './ui/textarea'

export function Chat() {
	const componentOwner = getOwner()!

	const [open, setOpen] = makePersisted(createSignal<boolean>(false))
	const [query, setQuery] = makePersisted(createSignal<string>(''))

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()
		try {
			await callFunctions(await getFunctions(query()), componentOwner)
			setQuery('')
		} catch (e) {
			console.error(e)
		}
	}

	function onKeyPress(e: KeyboardEvent) {
		const inp = e.currentTarget as HTMLTextAreaElement
		if (e.key === 'Enter' && e.shiftKey) {
			e.preventDefault()
			inp.form?.requestSubmit()
			return
		}
		setQuery(inp.value)
	}

	createEffect(() => {
		if (!open()) return
		setTimeout(() => {
			const inp = document.getElementById('ai-chat-query') as HTMLTextAreaElement
			inp?.focus()
			inp?.select()
		}, 100)
	})

	return (
		<Show
			when={open()}
			fallback={
				<Button
					class="opacity-50 hover:opacity-100 focus:opacity-100 items-center fixed gap-2 bottom-0 right-0 m-4 transition-all rounded-full"
					onClick={() => setOpen(true)}
				>
					<span class="i-carbon:chat text-lg"></span>
					<span class="text-sm font-semibold uppercase tracking-wide">AI Chat</span>
				</Button>
			}
		>
			<form onSubmit={onSubmit} class="fixed bottom-0 right-0 p-4 w-full max-w-[380px]">
				<Card
					class={cn(
						'data-[expanded]:zoom-in-95 data-[closed]:zoom-out-95 data-[expanded]:animate-in data-[closed]:animate-out'
					)}
					data-expanded={open() ? '' : undefined}
					data-closed={!open() ? '' : undefined}
				>
					<CardHeader>
						<CardTitle>Chat</CardTitle>
						<CardDescription>Chat with the AI assistant to take actions</CardDescription>
					</CardHeader>
					<CardContent class="grid gap-4">
						<Textarea
							id="ai-chat-query"
							class="h-48"
							name="query"
							value={query()}
							onKeyPress={onKeyPress}
						/>
					</CardContent>
					<CardFooter class="flex gap-4">
						<Button type="button" class="w-full" variant="ghost" onClick={() => setOpen(false)}>
							Close
						</Button>
						<Button type="submit" class="w-full">
							Submit
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Show>
	)
}

export default Chat
