<script lang="ts">
	import * as Breadcrumb from '$/components/ui/breadcrumb';

	export let path: string;
	$: parts = path.split('/').filter(Boolean);
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		{#each parts as part, index}
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href={`/${parts.slice(0, index + 1).join('/')}`}
					>{index === parts.length - 1 ? part : part.substring(0, 1)}</Breadcrumb.Link
				>
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
