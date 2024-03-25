import { nodeSchema } from '$/lib/db/schema';
import { z } from 'zod';

const listMetadataSchema = z.object({
	contacts: nodeSchema
		.refine((node) => node.name.endsWith('.contacts'), { message: 'Not a contact' })
		.array()
		.default([]),
	cycleDurationDays: z.number().int().min(1).default(1)
});

export { listMetadataSchema };
