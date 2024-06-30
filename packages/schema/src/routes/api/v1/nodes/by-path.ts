import { z } from 'zod';
import { ErrorResponseV1Schema } from '~schema/api';
import { nodeSchema } from '~schema/db';

const GetNodesByPathRequestV1Schema = z.object({
	includeChildren: z.boolean().default(false)
});

const GetNodesByPathResponseV1Schema = z.discriminatedUnion('success', [
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

export { GetNodesByPathRequestV1Schema, GetNodesByPathResponseV1Schema };
