import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { contactSchema } from '~schema/db';

const GetContactsRequestV1Schema = z.object({
	page: z.coerce.number().default(1),
	itemsPerPage: z.coerce.number().default(30)
});

const GetContactsResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contacts: contactSchema.omit({ createdAt: true, updatedAt: true }).array(),
			total: z.number().int().nonnegative()
		})
	}),
	ErrorResponseV1Schema
]);

const PostContactRequestV1Schema = z.object({
	contact: contactSchema
		.omit({ id: true, userId: true, createdAt: true, updatedAt: true, deleted: true })
		.required()
});

const PostContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contact: contactSchema.omit({ createdAt: true, updatedAt: true, deleted: true })
		})
	}),
	ErrorResponseV1Schema
]);

export {
	GetContactsRequestV1Schema,
	GetContactsResponseV1Schema,
	PostContactRequestV1Schema,
	PostContactResponseV1Schema
};
