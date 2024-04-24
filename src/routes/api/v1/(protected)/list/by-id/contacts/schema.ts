import { nodeSchema } from '$/lib/db/schema.libsql';
import { errorSchema } from '$/types';
import { contactMetadataSchema } from '$/types/contact';
import { z } from 'zod';

const getInputSchema = z.object({ id: z.coerce.number().int() });
const getOutputSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		status: z.number().int(),
		data: z.object({
			contacts: contactMetadataSchema.shape.contacts
				.removeDefault()
				.element.extend({ nodeId: nodeSchema.shape.id })
				.array()
		})
	}),
	z.object({
		success: z.literal(false),
		status: z.number().int(),
		errors: errorSchema.array()
	})
]);

export { getInputSchema, getOutputSchema };
