import { isServer } from 'solid-js/web'
import { fileSchema, folderSchema } from '~/types'
import { getSQLocalDB } from '.'

export const query = {
	async getFiles(parent_id?: number) {
		if (isServer) return []
		const { sql } = await getSQLocalDB()
		return fileSchema
			.array()
			.parse(
				parent_id
					? await sql`SELECT * FROM files WHERE parent_id = ${parent_id}`
					: await sql`SELECT * FROM files WHERE parent_id IS (SELECT id FROM folders WHERE name = 'root')`
			)
	},
	async getFolders(parent_id?: number) {
		if (isServer) return []
		const { sql } = await getSQLocalDB()
		return folderSchema
			.array()
			.parse(
				parent_id
					? await sql`SELECT * FROM folders WHERE parent_id = ${parent_id}`
					: await sql`SELECT * FROM folders WHERE parent_id IS (SELECT id FROM folders WHERE name = 'root')`
			)
	},
	async getFile(id: number) {
		if (isServer) return {} as TFile
		const { sql } = await getSQLocalDB()
		return fileSchema.parse(
			await sql`SELECT * FROM files WHERE id = ${id}`.then((result) => result[0])
		)
	},
	async getFolder(id: number) {
		if (isServer) return {} as TFolder
		const { sql } = await getSQLocalDB()
		return folderSchema.parse(
			await sql`SELECT * FROM folders WHERE id = ${id}`.then((result) => result[0])
		)
	},
	async getFilesAndFolders(parent_id?: number) {
		const [files, folders] = await Promise.all([
			query.getFiles(parent_id),
			query.getFolders(parent_id)
		])
		return { files, folders }
	},
	async getFileByNameAndParentId(name: string, parent_id: number) {
		if (isServer) return {} as TFile
		const { sql } = await getSQLocalDB()
		return fileSchema.parse(
			await sql`SELECT * FROM files WHERE name = ${name} AND parent_id = ${parent_id}`.then(
				(result) => result[0]
			)
		)
	},
	async getFolderByNameAndParentId(name: string, parent_id: number) {
		if (isServer) return {} as TFolder
		const { sql } = await getSQLocalDB()
		return folderSchema.parse(
			await sql`SELECT * FROM folders WHERE name = ${name} AND parent_id = ${parent_id}`.then(
				(result) => result[0]
			)
		)
	}
}

export const mutations = {
	async addContact(name: string, phone: string) {
		if (isServer) return
		const { sql } = await getSQLocalDB()
		await sql`INSERT INTO contacts (name, phone) VALUES (${name}, ${phone})`
	},
	async addFolder(name: string, parent_id?: number) {
		if (isServer) return
		const { sql } = await getSQLocalDB()
		parent_id
			? await sql`INSERT INTO folders (name, parent_id) VALUES (${name}, ${parent_id})`
			: await sql`INSERT INTO folders (name, parent_id) VALUES (${name}, (SELECT id FROM folders WHERE name = 'root'))`
	},
	async addFile(name: string, parent_id: number, metadata: Record<string, unknown> = {}) {
		if (isServer) return
		const { sql } = await getSQLocalDB()
		parent_id
			? await sql`INSERT INTO files (name, parent_id, metadata) VALUES (${name}, ${parent_id}, json(${JSON.stringify(metadata)}))`
			: await sql`INSERT INTO files (name, parent_id, metadata) VALUES (${name}, (SELECT id FROM folders WHERE name = 'root'), json(${JSON.stringify(metadata)}))`
	},
	async deleteFolders(ids: number[]) {
		if (isServer) return
		const { transaction } = await getSQLocalDB()
		await transaction((sql) =>
			ids.flatMap((id) => [
				sql`DELETE FROM files WHERE parent_id = ${id}`,
				sql`DELETE FROM folders WHERE parent_id = ${id}`,
				sql`DELETE FROM folders WHERE id = ${id}`
			])
		)
	},
	async deleteFiles(ids: number[]) {
		if (isServer) return
		const { transaction } = await getSQLocalDB()
		await transaction((sql) => ids.map((id) => sql`DELETE FROM files WHERE id = ${id}`))
	},
	async renameFolder(id: number, name: string) {
		if (isServer) return
		const { sql } = await getSQLocalDB()
		sql`UPDATE folders SET name = ${name} WHERE id = ${id}`
	},
	async renameFile(id: number, name: string) {
		if (isServer) return
		const { sql } = await getSQLocalDB()
		return sql`UPDATE files SET name = ${name} WHERE id = ${id}`
	}
}
