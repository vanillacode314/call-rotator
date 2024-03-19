import Fuse from 'fuse.js'
import { Owner, runWithOwner } from 'solid-js'
import { z } from 'zod'
import { createZodFetcher } from 'zod-fetch'
import { mutations, query } from '~/lib/db/utils'
import { useFilesystem } from '~/stores'
import { asyncMap } from '~/utils'

type TArgtype = 'string' | 'number' | 'boolean'
const fetcher = createZodFetcher()
const LLM_FUNCTIONS = new Map(
	Object.entries({
		add_folder: {
			argtypes: ['string'],
			action: async function ({ name }: { name: string }, owner: Owner) {
				const [{ activeFolder }, { refetchFilesAndFolders }] = runWithOwner(owner, useFilesystem)!
				await mutations.addFolder(name, activeFolder().id)
				refetchFilesAndFolders()
			}
		},
		add_file: {
			argtypes: ['string'],
			action: async function ({ name }: { name: string }, owner: Owner) {
				const [{ activeFolder }, { refetchFilesAndFolders }] = runWithOwner(owner, useFilesystem)!
				await mutations.addFile(name, activeFolder().id)
				refetchFilesAndFolders()
			}
		},
		delete_folders: {
			argtypes: ['string[]'],
			action: async function ({ names }: { names: string[] }, owner: Owner) {
				const [{ activeFolder }, { refetchFilesAndFolders }] = runWithOwner(owner, useFilesystem)!
				const folders = await query.getFolders(activeFolder().id)
				const fuse = new Fuse(folders, { keys: ['name'] })
				await mutations.deleteFolders(
					names.map(
						(name) =>
							fuse.search(name)[0]?.item.id ??
							query.getFolderByNameAndParentId(name, activeFolder()!.id)
					)
				)
				refetchFilesAndFolders()
			}
		},
		delete_files: {
			argtypes: ['string[]'],
			action: async function ({ names }: { names: string[] }, owner: Owner) {
				const [{ activeFolder }, { refetchFilesAndFolders }] = runWithOwner(owner, useFilesystem)!
				const files = await query.getFiles(activeFolder().id)
				const fuse = new Fuse(files, { keys: ['name'] })
				await mutations.deleteFiles(
					names.map(
						(name) =>
							fuse.search(name)[0]?.item.id ??
							query.getFileByNameAndParentId(name, activeFolder()!.id)
					)
				)
				refetchFilesAndFolders()
			}
		},
		get_all_folders: {
			argtypes: [],
			action: async function (_, owner: Owner) {
				const [{ activeFolder }, {}] = runWithOwner(owner, useFilesystem)!
				return query
					.getFolders(activeFolder()!.id)
					.then((folders) => folders.map((folder) => folder.name))
			}
		},
		get_all_files: {
			argtypes: [],
			action: async function (_, owner: Owner) {
				const [{ activeFolder }, {}] = runWithOwner(owner, useFilesystem)!
				return query.getFiles(activeFolder()!.id).then((files) => files.map((file) => file.name))
			}
		}
	} satisfies Record<
		string,
		{ argtypes: (TArgtype | `${TArgtype}[]`)[]; action: (...args: any[]) => Promise<unknown> }
	>)
)

function generateCompletion(model: string, prompt: string) {
	return fetcher(z.object({ response: z.string() }), 'http://localhost:11434/api/generate', {
		method: 'POST',
		body: JSON.stringify({
			model,
			prompt,
			stream: false,
			options: {
				stop: ['Thought:']
			}
		})
	})
}

async function getFunctions(query: string) {
	const { response } = await generateCompletion(
		'nexusraven',
		`
			Function:
			def add_folder(name: str):
			"""Add a new folder. Can only take one name at a time"""

			def add_file(name: str):
			"""Add a new file. Can only take one name at a time"""

			def delete_folders(names: list[str]):
			"""Delete folders. Can take multiple names at once"""

			def delete_files(names: list[str]):
			"""Delete files. Can take multiple names at once"""
			
			def get_all_folders():
			"""Get all folders"""

			def get_all_files():
			"""Get all files"""

			User Query: ${query}<human_end>
		`
	)

	return response
		.trim()
		.substring(6)
		.split(';')
		.map((s) => s.trim())
		.filter(Boolean)
}

function isFunction(s: string) {
	return /[\w_]+\([^\)]*\)/.test(s)
}

function argStringToTuple(args: string) {
	return args
		.split(',')
		.filter(Boolean)
		.map((arg) => arg.trim().split('='))
}

async function getArgs(func: string, argtypes: (TArgtype | `${TArgtype}[]`)[], owner: Owner) {
	if (!isFunction(func)) throw new Error('Invalid function')

	return Object.fromEntries(
		await asyncMap(
			argStringToTuple(func.substring(func.indexOf('(') + 1, func.length - 1)),
			async ([key, value], index) => {
				let retval: readonly [string, any] = [key, value]
				if (isFunction(value)) return [key, await runFunction(value, owner)]

				const argtype = argtypes[index]
				const isArrayType = argtype.endsWith('[]')
				const values = isArrayType ? value.slice(1, -1).split(',') : [value]

				switch (isArrayType ? (argtype.slice(0, -2) as TArgtype) : argtype) {
					case 'string':
						// removes quotes
						retval = [key, values.map((v) => v.slice(1, -1))] as const
						break
					case 'number':
						retval = [key, values.map(Number)] as const
						break
					case 'boolean':
						retval = [key, values.map(Boolean)] as const
						break
					default:
						throw new Error('Invalid arg type')
				}

				if (!isArrayType) retval = [key, retval[1][0]] as const
				return retval
			}
		)
	)
}

async function runFunction(func: string, owner: Owner): Promise<any> {
	const name = func.substring(0, func.indexOf('(')) as MapKeys<typeof LLM_FUNCTIONS>
	if (!LLM_FUNCTIONS.has(name)) {
		console.error(`Unknown function: ${name}`)
		return
	}
	const { argtypes, action } = LLM_FUNCTIONS.get(name)!
	const args = await getArgs(func, argtypes, owner)
	console.log(`Running function: ${name}(${JSON.stringify(args)})`)
	// @ts-ignore
	return await action(args, owner)
}

async function callFunctions(funcs: string[], owner: Owner) {
	for (const func of funcs) {
		await runFunction(func, owner)
	}
}

export { getFunctions, callFunctions }
