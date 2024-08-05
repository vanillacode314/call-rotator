import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { nodeSchema } from '~schema/db';

const PostNodeRequestV1Schema = z.object({
	node: nodeSchema
		.omit({ id: true, userId: true, createdAt: true, updatedAt: true, deleted: true, listId: true })
		.required()
});
const PostNodeResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			node: nodeSchema
		})
	}),
	ErrorResponseV1Schema
]);

export { PostNodeRequestV1Schema, PostNodeResponseV1Schema };
