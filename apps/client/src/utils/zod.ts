import { createZodFetcher } from 'zod-fetch';

function createFetcher(
	fetcher: (input: TFetchParams[0], init?: TFetchParams[1]) => Promise<Response>,
	defaultInit: TFetchParams[1]
) {
	return createZodFetcher((input: TFetchParams[0], init: TFetchParams[1] = {}) =>
		fetcher(input, { ...defaultInit, ...init }).then((res) => res.json())
	);
}

export { createFetcher };
