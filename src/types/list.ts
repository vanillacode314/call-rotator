import { z } from 'zod';
import { contactMetadataSchema } from './contact';

const listMetadataSchema = z.object({
	contacts: z
		.record(
			z.coerce.number(),
			contactMetadataSchema.shape.contacts.removeDefault().element.shape.phone.array().default([])
		)
		.default({}),
	cycleDurationDays: z.number().int().min(1).default(1),
	startDate: z.date({ coerce: true }).default(new Date())
});

export { listMetadataSchema };

declare global {
	type TListMetadata = z.infer<typeof listMetadataSchema>;
}
