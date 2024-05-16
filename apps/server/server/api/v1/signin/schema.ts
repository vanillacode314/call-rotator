import { z } from 'zod';

const formDataSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

export { formDataSchema };
