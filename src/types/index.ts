import { z } from 'zod';

const errorCodeSchema = z.enum([
	'INVALID_CREDENTIALS',
	'INVALID_FORMDATA',
	'INVALID_QUERY',
	'EMAIL_ALREADY_REGISTERED',
	'NOT_FOUND',
	'INVALID_PATH',
	'CONFLICT',
	'INTERNAL_SERVER_ERROR'
]);
const errorSchema = z.object({
	code: errorCodeSchema,
	message: z.string()
});

declare global {
	type MaybePromise<T> = T | Promise<T>;
	type MapKeys<TMap> = TMap extends Map<infer TKey, any> ? TKey : never;
	type TError = z.infer<typeof errorSchema>;
	type TErrorCode = z.infer<typeof errorCodeSchema>;
	type TFetch = typeof fetch;
	type TFetchParams = Parameters<TFetch>;
}

export { errorCodeSchema, errorSchema };
