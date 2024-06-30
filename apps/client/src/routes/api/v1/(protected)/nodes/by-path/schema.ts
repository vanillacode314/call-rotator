import { errorSchema } from '$/types';
import { nodeSchema } from 'schema/db';
import { z } from 'zod';

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
