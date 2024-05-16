import { errorSchema } from '$/types';
import { isValidJSON } from '$/utils';
import { z } from 'zod';
import { nodeSchema } from '~db/schema';

const getInputSchema = z.object({
	id: z.coerce.number().int(),
	includeChildren: z.boolean().default(false)
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
const putInputSchema = z.object({
	node: z
		.string({ required_error: 'Node data is required' })
		.refine((value) => isValidJSON(value), { message: 'Node data must be valid JSON' })
		.refine(
			(value) => {
				const result = nodeSchema
					.omit({ userId: true })
					.partial()
					.required({ id: true })
					.safeParse(JSON.parse(value));
				return result.success;
			},
			{ message: 'Invalid node data' }
		)
		.transform((value) =>
			nodeSchema.omit({ userId: true }).partial().required({ id: true }).parse(JSON.parse(value))
		)
		.or(nodeSchema.omit({ userId: true }).partial().required({ id: true }))
});
const putOutputSchema = z.discriminatedUnion('success', [
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

const deleteInputSchema = z.object({
	id: z.coerce
		.number({
			required_error: 'Node ID is required',
			invalid_type_error: 'Node ID must be an integer'
		})
		.int()
});
const deleteOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: z.object({})
	}),
	z.object({
		success: z.literal(false),
		status: z.number().int(),
		errors: errorSchema.array()
	})
]);

export {
	deleteInputSchema,
	deleteOutputSchema,
	getInputSchema,
	getOutputSchema,
	postInputSchema,
	postOutputSchema,
	putInputSchema,
	putOutputSchema
};
