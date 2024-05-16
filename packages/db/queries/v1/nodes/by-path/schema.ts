import { z } from 'zod';
import { nodeSchema } from '~db/schema';
import { errorSchema } from '~db/types';

const getInputSchema = z.object({
	path: z.string().trim(),
	includeChildren: z.coerce.boolean().default(false)
});
const getOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: z.object({ node: nodeSchema, children: nodeSchema.array().default([]) })
	}),
	z.object({
		success: z.literal(false),
		status: z.number().int(),
		errors: errorSchema.array()
	})
]);

export { getInputSchema, getOutputSchema };
