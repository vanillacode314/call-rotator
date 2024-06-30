import { errorSchema } from '$/types';
import { isValidJSON } from '$/utils';
import { contactSchema } from 'schema/db';
import { z } from 'zod';

const getInputSchema = z.object({
	page: z.coerce.number().default(1),
	itemsPerPage: z.coerce.number().default(30)
});

const getOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: z.object({
			total: z.number().int(),
			contacts: contactSchema.array()
		})
	}),
	z.object({
		success: z.literal(false),
		status: z.number().int(),
		errors: errorSchema.array()
	})
]);
const postInputSchema = z.object({
	contact: z
		.string({ required_error: 'Contact data is required' })
		.refine((value) => isValidJSON(value), { message: 'Contact data must be valid JSON' })
		.refine(
			(value) => {
				const result = contactSchema.omit({ id: true, userId: true }).safeParse(JSON.parse(value));
				return result.success;
			},
			{ message: 'Invalid node data' }
		)
		.transform((value) => contactSchema.omit({ id: true, userId: true }).parse(JSON.parse(value)))
		.or(contactSchema.omit({ id: true, userId: true }))
});
const postOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: contactSchema
	}),
	z.object({
		success: z.literal(false),
		status: z.number().int(),
		errors: errorSchema.array()
	})
]);

const putInputSchema = z.object({
	contact: z
		.string({ required_error: 'Contact data is required' })
		.refine((value) => isValidJSON(value), { message: 'Contact data must be valid JSON' })
		.refine(
			(value) => {
				const result = contactSchema
					.omit({ userId: true })
					.partial()
					.required({ id: true })
					.safeParse(JSON.parse(value));
				return result.success;
			},
			{ message: 'Invalid node data' }
		)
		.transform((value) =>
			contactSchema.omit({ userId: true }).partial().required({ id: true }).parse(JSON.parse(value))
		)
		.or(contactSchema.omit({ userId: true }).partial().required({ id: true }))
});
const putOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: contactSchema
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
			required_error: 'Contact ID is required',
			invalid_type_error: 'Contact ID must be an integer'
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
