import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';

const DeleteListContactByIdRequestV1Schema = z.unknown();
const DeleteListContactByIdResponseV1Schema = z.discriminatedUnion('success', [
	z.object({
		status: z.number(),
		success: z.literal(true),
		result: z.object({})
	}),
	ErrorResponseV1Schema
]);

export { DeleteListContactByIdRequestV1Schema, DeleteListContactByIdResponseV1Schema };
