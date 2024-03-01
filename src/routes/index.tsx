import { useNavigate } from '@solidjs/router'
import { For, ParentComponent, Show, Suspense, createEffect } from 'solid-js'
import { Sidebar } from '~/components/Sidebar'
import { setAddFolderDialogOpen } from '~/components/modals/AddFolderModal'
import { setAddListDialogOpen } from '~/components/modals/AddListModal'
import { setRenameFolderDialogOpen } from '~/components/modals/RenameFolderModal'
import { setRenameListDialogOpen } from '~/components/modals/RenameListModal'
import { Button } from '~/components/ui/button'
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuPortal,
	ContextMenuTrigger
} from '~/components/ui/context-menu'
import { Skeleton } from '~/components/ui/skeleton'
import { mutations } from '~/lib/db/utils'
import { cn } from '~/lib/utils'
import { useFilesystem } from '~/stores'

export default function Home() {
	const [{ filesAndFolders, activeFolder }, { changeDirectory }] = useFilesystem()
	const isEmpty = () =>
		!(filesAndFolders.latest.files.length || filesAndFolders.latest.folders.length)

	const navigate = useNavigate()

	return (
		<div class="bg-background h-full grid md:grid-cols-[200px_1fr] container p-0 mx-auto">
			<div class="hidden md:contents">
				<Sidebar class="p-4" />
			</div>
			<div
				class={cn(
					'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-4',
					!isEmpty() && 'content-start'
				)}
			>
				<Suspense
					fallback={
						<div class="flex items-center space-x-4">
							<Skeleton class="size-12 rounded-full" />
							<div class="space-y-2">
								<Skeleton class="h-4 w-[250px]" />
								<Skeleton class="h-4 w-[200px]" />
							</div>
						</div>
					}
				>
					<Show when={activeFolder().name !== 'root'}>
						<Button
							variant="secondary"
							class="flex gap-2 items-center justify-start"
							onClick={() => changeDirectory(activeFolder().parent_id ?? 1)}
						>
							<span class="i-carbon:folder"></span>
							<span>..</span>
						</Button>
					</Show>
					<Show
						when={!isEmpty()}
						fallback={
							activeFolder().name === 'root' ? (
								<div class="grid h-full col-span-full gap-4 place-content-center place-items-center text-3xl font-bold uppercase tracking-wide">
									<div class="i-nimbus:box-unpacked text-5xl"></div>
									<span>No files</span>
									<div class="flex flex-col items-center gap-4 md:flex-row">
										<Button size="lg" onClick={() => setAddFolderDialogOpen(true)}>
											Add a new folder
										</Button>
										<span class="text-xl">OR</span>
										<Button size="lg" onClick={() => setAddListDialogOpen(true)}>
											Add a new list
										</Button>
									</div>
								</div>
							) : undefined
						}
					>
						<>
							<For each={filesAndFolders.latest.folders}>
								{(folder) => (
									<ContextMenuFolder folder={folder}>
										<Button
											variant="secondary"
											class="flex gap-2 items-center justify-start"
											onClick={() => changeDirectory(folder.id)}
										>
											<span class="i-carbon:folder"></span>
											<span class="truncate">{folder.name}</span>
										</Button>
									</ContextMenuFolder>
								)}
							</For>
							<For each={filesAndFolders.latest.files}>
								{(file) => (
									<ContextMenuFile file={file}>
										<Button
											variant="secondary"
											class="flex gap-2 items-center justify-start"
											onClick={() => navigate(`/list/${file.id}`)}
										>
											<span class="i-carbon:document"></span>
											<span class="truncate">{file.name}</span>
										</Button>
									</ContextMenuFile>
								)}
							</For>
						</>
					</Show>
				</Suspense>
			</div>
		</div>
	)
}

const ContextMenuFolder: ParentComponent<{ folder: TFolder }> = (props) => {
	const [{}, { refetchFilesAndFolders, setSelectedFolder }] = useFilesystem()

	return (
		<ContextMenu>
			<ContextMenuTrigger class="contents">{props.children}</ContextMenuTrigger>
			<ContextMenuPortal>
				<ContextMenuContent class="w-48">
					<ContextMenuItem
						onSelect={() => mutations.deleteFolders([props.folder.id]).then(refetchFilesAndFolders)}
					>
						<span>Delete</span>
						<span class="ml-auto i-carbon:trash-can"></span>
					</ContextMenuItem>
					<ContextMenuItem
						onSelect={() => {
							setSelectedFolder(props.folder)
							setRenameFolderDialogOpen(true)
						}}
					>
						<span>Rename</span>
						<span class="ml-auto i-carbon:edit"></span>
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenuPortal>
		</ContextMenu>
	)
}

const ContextMenuFile: ParentComponent<{ file: TFile }> = (props) => {
	const [{}, { setSelectedFile, refetchFilesAndFolders }] = useFilesystem()

	return (
		<ContextMenu>
			<ContextMenuTrigger class="contents">{props.children}</ContextMenuTrigger>
			<ContextMenuPortal>
				<ContextMenuContent class="w-48">
					<ContextMenuItem
						onSelect={() => mutations.deleteFiles([props.file.id]).then(refetchFilesAndFolders)}
					>
						<span>Delete</span>
						<span class="ml-auto i-carbon:trash-can"></span>
					</ContextMenuItem>
					<ContextMenuItem
						onSelect={() => {
							setSelectedFile(props.file)
							setRenameListDialogOpen(true)
						}}
					>
						<span>Rename</span>
						<span class="ml-auto i-carbon:edit"></span>
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenuPortal>
		</ContextMenu>
	)
}
