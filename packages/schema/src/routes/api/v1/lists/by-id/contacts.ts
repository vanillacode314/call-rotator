import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { contactSchema } from '~schema/db';

const PostListContactByIdRequestV1Schema = z.object({
	contactIds: contactSchema.shape.id.array()
});

const PostListContactByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({
			contacts: contactSchema.array()
		})
	}),
	ErrorResponseV1Schema
]);

export { PostListContactByIdRequestV1Schema, PostListContactByIdResponseV1Schema };
