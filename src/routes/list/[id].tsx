import { useParams } from '@solidjs/router'
import { Show, createResource } from 'solid-js'
import { query } from '~/lib/db/utils'

export default function ListPage() {
	const params = useParams()

	const [file] = createResource(
		() => params.id,
		() => query.getFile(Number(params.id))
	)

	return (
		<Show when={file()}>
			{(file) => (
				<div class="container p-4 mx-auto">
					<pre>{JSON.stringify(file(), null, 2)}</pre>
				</div>
			)}
		</Show>
	)
}
