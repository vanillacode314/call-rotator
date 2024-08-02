import { z } from 'zod';
import { userSchema } from '~schema/db';

const GetSessionResponseV1Schema = z.object({
	user: userSchema
		.pick({ id: true, email: true })
		.extend({
			lastSyncAt: z
				.string()
				.nullish()
				.transform((value) => {
					if (value === undefined || value === null) return null;
					try {
						return new Date(value);
					} catch {
						return null;
					}
				})
				.or(z.date())
				.optional(),
			iat: z.number(),
			exp: z.number()
		})
		.nullable(),
	status: z.number()
});

export { GetSessionResponseV1Schema };
