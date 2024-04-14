import { errorSchema } from '$/types';
import { z } from 'zod';

const formDataSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

const responseSchema = z.object({
	success: z.literal(false),
	errors: errorSchema.array()
});

export { formDataSchema, responseSchema };
