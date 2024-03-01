// @refresh reload
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from '@kobalte/core'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start'
import { Suspense, onMount } from 'solid-js'
import { getRequestEvent, isServer } from 'solid-js/web'
import 'virtual:uno.css'
import { Nav } from '~/components/Nav'
import { AllModals } from '~/components/modals/AllModals'
import { initDB } from '~/lib/db/schema'
import { FilesystemContextProvider } from '~/stores'
import './app.css'
import { Chat } from './components/Chat'

export default function App() {
	onMount(() => {
		initDB()
	})
	const event = getRequestEvent()
	const storageManager = cookieStorageManagerSSR(
		isServer ? event?.request.headers.get('cookie') ?? '' : document.cookie
	)
	return (
		<Router
			root={(props) => (
				<>
					<ColorModeScript storageType={storageManager.type} />
					<Suspense>
						<FilesystemContextProvider>
							<ColorModeProvider storageManager={storageManager}>
								<Nav />
								{props.children}
								<AllModals />
								<Chat />
							</ColorModeProvider>
						</FilesystemContextProvider>
					</Suspense>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	)
}
