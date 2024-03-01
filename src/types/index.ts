import { z } from 'zod'

const folderSchema = z.object({
	id: z.number(),
	name: z.string(),
	parent_id: z.number().nullable()
})

const metadataSchema = z.record(z.string(), z.unknown())
const fileSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		parent_id: z.number(),
		metadata: z.string()
	})
	.transform((data) => ({ ...data, metadata: metadataSchema.parse(JSON.parse(data.metadata)) }))

export { folderSchema, fileSchema }

declare global {
	type TFolder = z.infer<typeof folderSchema>
	type TFile = z.infer<typeof fileSchema>
	type MaybePromise<T> = T | Promise<T>
	type MapKeys<TMap> = TMap extends Map<infer TKey, any> ? TKey : never
}
