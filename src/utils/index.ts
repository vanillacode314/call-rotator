import type z from 'zod'
function parseFormData<T extends z.ZodTypeAny>(form: HTMLFormElement, schema: T): z.infer<T> {
	return schema.parse(Object.fromEntries(new FormData(form)))
}

function selectInputById(id: string) {
	const input = document.getElementById(id) as HTMLInputElement
	if (!input) throw new Error(`Input with id ${id} not found`)
	input.select()
}

function asyncMap<T, U>(
	arr: T[],
	fn: (item: T, index: number, arr: T[]) => Promise<U>
): Promise<U[]> {
	return Promise.all(arr.map(fn))
}

export { parseFormData, selectInputById, asyncMap }
