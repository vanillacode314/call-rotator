import type { GetSessionResponseV1Schema } from 'schema/routes/api/v1/get-session';
import type { TypeOf } from 'zod';

declare module 'h3' {
	interface H3EventContext {
		user: NonNullable<
			TypeOf<typeof GetSessionResponseV1Schema.shape.user> & { exp: number; iat: number }
		>;
	}
}

export {};
