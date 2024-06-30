import { errorSchema } from '$/types';
import { isValidJSON } from '$/utils';
import { nodeSchema } from 'schema/db';
import { z } from 'zod';

const postInputSchema = z.object({
	node: z
		.string({ required_error: 'Node data is required' })
		.refine((value) => isValidJSON(value), { message: 'Node data must be valid JSON' })
		.refine(
			(value) => {
				const result = nodeSchema.omit({ id: true, userId: true }).safeParse(JSON.parse(value));
				return result.success;
			},
			{ message: 'Invalid node data' }
		)
		.transform((value) => nodeSchema.omit({ id: true, userId: true }).parse(JSON.parse(value)))
		.or(nodeSchema.omit({ id: true, userId: true }))
});
const postOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: nodeSchema
	}),
	z.object({
		success: z.literal(false),
		status: z.number().int(),
		errors: errorSchema.array()
	})
]);

export { postInputSchema, postOutputSchema };
