<script lang="ts">
	import { renameFolderDialogOpen } from '$/components/modals/RenameFolderModal.svelte';
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuItem,
		ContextMenuContent
	} from '$/components/ui/context-menu';
	import { mutations } from '$/lib/db/utils';
	import { useFileSystem } from '$/stores';

	const { selectedFolder, filesAndFolders } = useFileSystem();

	export let folder: TFolder;
</script>

<ContextMenu>
	<ContextMenuTrigger class="contents"><slot /></ContextMenuTrigger>
	<ContextMenuContent class="w-48">
		<ContextMenuItem
			on:click={() => mutations.deleteFolders([folder.id]).then(() => filesAndFolders.reload?.())}
		>
			<span>Delete</span>
			<span class="i-carbon:trash-can ml-auto"></span>
		</ContextMenuItem>
		<ContextMenuItem
			on:click={() => {
				$selectedFolder = folder;
				$renameFolderDialogOpen = true;
			}}
		>
			<span>Rename</span>
			<span class="i-carbon:edit ml-auto"></span>
		</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>

<!-- const ContextMenuFile: ParentComponent<{ file: TFile }> = (props) => { -->
<!-- 	const [{}, { setSelectedFile, refetchFilesAndFolders }] = useFilesystem() -->
<!---->
<!-- 	return ( -->
<!-- 		<ContextMenu> -->
<!-- 			<ContextMenuTrigger class="contents">{props.children}</ContextMenuTrigger> -->
<!-- 			<ContextMenuPortal> -->
<!-- 				<ContextMenuContent class="w-48"> -->
<!-- 					<ContextMenuItem -->
<!-- 						onSelect={() => mutations.deleteFiles([props.file.id]).then(refetchFilesAndFolders)} -->
<!-- 					> -->
<!-- 						<span>Delete</span> -->
<!-- 						<span class="ml-auto i-carbon:trash-can"></span> -->
<!-- 					</ContextMenuItem> -->
<!-- 					<ContextMenuItem -->
<!-- 						onSelect={() => { -->
<!-- 							setSelectedFile(props.file) -->
<!-- 							setRenameListDialogOpen(true) -->
<!-- 						}} -->
<!-- 					> -->
<!-- 						<span>Rename</span> -->
<!-- 						<span class="ml-auto i-carbon:edit"></span> -->
<!-- 					</ContextMenuItem> -->
<!-- 				</ContextMenuContent> -->
<!-- 			</ContextMenuPortal> -->
<!-- 		</ContextMenu> -->
<!-- 	) -->
<!-- } -->
