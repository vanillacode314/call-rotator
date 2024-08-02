import { type TIssue } from 'schema/api';
import { toast } from 'svelte-sonner';
import type z from 'zod';

function parseFormData<T extends z.ZodTypeAny>(form: HTMLFormElement, schema: T): z.infer<T> {
	return schema.parse(Object.fromEntries(new FormData(form)));
}

function safeParseFormData<T extends z.ZodTypeAny>(
	form: HTMLFormElement,
	schema: T
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
	return schema.safeParse(Object.fromEntries(new FormData(form)));
}

function selectInputById(id: string) {
	const input = document.getElementById(id) as HTMLInputElement;
	if (!input) throw new Error(`Input with id ${id} not found`);
	input.select();
}

function asyncMap<T, U>(
	arr: T[],
	fn: (item: T, index: number, arr: T[]) => Promise<U>
): Promise<U[]> {
	return Promise.all(arr.map(fn));
}

function filterInPlace<T>(arr: T[], fn: (item: T) => boolean): T[] {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (!fn(arr[i])) arr.splice(i, 1);
	}
	return arr;
}

function isEmpty(obj: Record<string, unknown>) {
	return Object.keys(obj).length === 0;
}

function formatDate(date: Date) {
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear().toString();
	return `${year}-${month}-${day}`;
}

function toastErrors(issues: TIssue[]) {
	for (const { message, code } of issues) {
		toast.error(code.replace(/_/g, ' '), { description: message });
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidJSON(json: string) {
	try {
		JSON.parse(json);
		return true;
	} catch (e) {
		return false;
	}
}

function omitKeys<T extends Record<string, unknown>>(
	obj: T,
	keys: (keyof T | (string & {}))[]
): Omit<T, (typeof keys)[number]> {
	const copy = { ...obj };
	for (const key of keys) {
		delete copy[key];
	}
	return copy;
}

export {
	asyncMap,
	filterInPlace,
	formatDate,
	isEmpty,
	isValidJSON,
	omitKeys,
	parseFormData,
	safeParseFormData,
	selectInputById,
	sleep,
	toastErrors
};
