import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { contactSchema, listSchema } from '~schema/db';

const GetListByPathRequestV1Schema = z.object({});
const GetListByPathResponseV1Schema = z.discriminatedUnion('success', [
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

export { GetListByPathRequestV1Schema, GetListByPathResponseV1Schema };
