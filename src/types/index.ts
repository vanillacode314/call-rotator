declare global {
	type MaybePromise<T> = T | Promise<T>;
	type MapKeys<TMap> = TMap extends Map<infer TKey, any> ? TKey : never;
}

export {};
