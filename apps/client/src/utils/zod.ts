import { createZodFetcher } from 'zod-fetch';

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

function reviver(key: string, value: string) {
	if (typeof value === 'string' && dateFormat.test(value)) {
		return new Date(value);
	}

	return value;
}

function createFetcher(
	fetcher: (input: TFetchParams[0], init?: TFetchParams[1]) => Promise<Response>,
	defaultInit: TFetchParams[1] = {}
) {
	return createZodFetcher((input: TFetchParams[0], init: TFetchParams[1] = {}) =>
		fetcher(input, { ...defaultInit, ...init }).then(async (res) =>
			JSON.parse(await res.text(), reviver)
		)
	);
}

export { createFetcher };
