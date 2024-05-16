import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		AUTH_SECRET: z.string(),
		TURSO_AUTH_TOKEN: z.string(),
		TURSO_CONNECTION_URL: z.string()
	},
	client: {},
	clientPrefix: 'PUBLIC_',
	runtimeEnv: process.env
});
