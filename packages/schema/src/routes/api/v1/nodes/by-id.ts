import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { nodeSchema } from '~schema/db';

const GetNodeByIdRequestV1Schema = z.object({ includeChildren: z.boolean().default(false) });
const GetNodeByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			node: nodeSchema,
			children: nodeSchema.array()
		})
	}),
	ErrorResponseV1Schema
]);

const PutNodeByIdRequestV1Schema = z.object({
	node: nodeSchema.omit({ id: true, userId: true }).partial()
});
const PutNodeByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			node: nodeSchema
		})
	}),
	ErrorResponseV1Schema
]);

const DeleteNodeByIdRequestV1Schema = z.unknown();
const DeleteNodeByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({})
	}),
	ErrorResponseV1Schema
]);

export {
	DeleteNodeByIdRequestV1Schema,
	DeleteNodeByIdResponseV1Schema,
	GetNodeByIdRequestV1Schema,
	GetNodeByIdResponseV1Schema,
	PutNodeByIdRequestV1Schema,
	PutNodeByIdResponseV1Schema
};
