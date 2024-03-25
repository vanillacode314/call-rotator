import { z } from 'zod';

const contactMetadataSchema = z.object({
	contacts: z
		.object({
			name: z.string(),
			phone: z.string(),
			notes: z.string().default('')
		})
		.array()
		.default([])
});

export { contactMetadataSchema };

declare global {
	type TContact = z.infer<typeof contactMetadataSchema>['contacts'][number];
}
