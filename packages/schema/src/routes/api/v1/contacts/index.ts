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
			contacts: contactSchema.array(),
			total: z.number().int().nonnegative()
		})
	}),
	ErrorResponseV1Schema
]);

const PostContactsRequestV1Schema = z.object({
	contact: contactSchema.omit({ id: true, userId: true }).required()
});

const PostContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contact: contactSchema
		})
	}),
	ErrorResponseV1Schema
]);

const PutContactsRequestV1Schema = z.object({
	contact: contactSchema.omit({ id: true, userId: true }).partial()
});

const PutContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contact: contactSchema
		})
	}),
	ErrorResponseV1Schema
]);

const DeleteContactRequestV1Schema = z.unknown();
const DeleteContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contact: contactSchema
		})
	}),
	ErrorResponseV1Schema
]);

export {
	DeleteContactRequestV1Schema,
	DeleteContactResponseV1Schema,
	GetContactsRequestV1Schema,
	GetContactsResponseV1Schema,
	PostContactResponseV1Schema,
	PostContactsRequestV1Schema,
	PutContactResponseV1Schema,
	PutContactsRequestV1Schema
};
