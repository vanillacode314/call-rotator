import { createZodFetcher } from 'zod-fetch';

function createFetcher(
	fetcher: (input: TFetchParams[0], init?: TFetchParams[1]) => Promise<Response>
) {
	return createZodFetcher((input: TFetchParams[0], init?: TFetchParams[1]) =>
		fetcher(input, init).then((res) => res.json())
	);
}

export { createFetcher };
