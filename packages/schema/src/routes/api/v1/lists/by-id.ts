import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { contactSchema, listSchema } from '~schema/db';

const GetListByIdRequestV1Schema = z.object({});
const GetListByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			list: listSchema,
			contacts: contactSchema.array()
		})
	}),
	ErrorResponseV1Schema
]);

const PutListByIdRequestV1Schema = z.object({
	list: listSchema.omit({ id: true, userId: true, deleted: true }).partial()
});
const PutListByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			list: listSchema
		})
	}),
	ErrorResponseV1Schema
]);

export {
	GetListByIdRequestV1Schema,
	GetListByIdResponseV1Schema,
	PutListByIdRequestV1Schema,
	PutListByIdResponseV1Schema
};
