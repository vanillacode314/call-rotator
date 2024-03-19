// @refresh reload
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from '@kobalte/core'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense, onMount } from 'solid-js'
import { getRequestEvent, isServer } from 'solid-js/web'
import 'virtual:uno.css'
import { Nav } from '~/components/Nav'
import { initDB } from '~/lib/db/schema'
import { FilesystemContextProvider } from '~/stores'
import './app.css'
import { Chat } from './components/Chat'
import { AllModals } from './components/modals/AllModals'

export default function App() {
	initDB()
	const event = getRequestEvent()
	const storageManager = cookieStorageManagerSSR(
		isServer ? event?.request.headers.get('cookie') ?? '' : document.cookie
	)
	return (
		<Router
			root={(props) => (
				<>
					<MetaProvider>
						<Title>Call Rotator</Title>
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
					</MetaProvider>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	)
}
