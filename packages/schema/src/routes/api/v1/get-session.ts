import { z } from 'zod';
import { userSchema } from '~schema/db';

const GetSessionResponseV1Schema = z.object({
	user: userSchema.pick({ id: true, email: true }).nullable(),
	status: z.number()
});

export { GetSessionResponseV1Schema };
