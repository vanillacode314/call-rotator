import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { contactSchema } from '~schema/db';

const GetContactRequestV1Schema = z.object({});

const GetContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contact: contactSchema.omit({ createdAt: true, updatedAt: true })
		})
	}),
	ErrorResponseV1Schema
]);

const PutContactRequestV1Schema = z.object({
	contact: contactSchema
		.omit({ id: true, userId: true, createdAt: true, updatedAt: true })
		.partial()
});

const PutContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contact: contactSchema.omit({ createdAt: true, updatedAt: true })
		})
	}),
	ErrorResponseV1Schema
]);

const DeleteContactRequestV1Schema = z.unknown();
const DeleteContactResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({})
	}),
	ErrorResponseV1Schema
]);

export {
	DeleteContactRequestV1Schema,
	DeleteContactResponseV1Schema,
	GetContactRequestV1Schema,
	GetContactResponseV1Schema,
	PutContactRequestV1Schema,
	PutContactResponseV1Schema
};
