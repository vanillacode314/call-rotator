import { z } from 'zod';
import { contactMetadataSchema } from './contact';

const listMetadataSchema = z.object({
	contacts: z
		.object({
			nodeId: z.coerce.number(),
			phones: contactMetadataSchema.shape.contacts
				.removeDefault()
				.element.shape.phone.array()
				.default([])
		})
		.array()
		.default([]),
	cycleDurationDays: z.number().int().min(1).default(1),
	startDate: z.date({ coerce: true }).default(new Date())
});

export { listMetadataSchema };

declare global {
	type TListMetadata = z.infer<typeof listMetadataSchema>;
}
