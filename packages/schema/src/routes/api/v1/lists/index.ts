import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { listSchema } from '~schema/db';

const PostListRequestV1Schema = z.object({
	list: listSchema.omit({ id: true, userId: true }).required()
});

const PostListResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			list: listSchema
		})
	}),
	ErrorResponseV1Schema
]);

export { PostListRequestV1Schema, PostListResponseV1Schema };
