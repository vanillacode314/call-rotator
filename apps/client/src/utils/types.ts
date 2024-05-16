import type { z } from 'zod';

function parseMetadata<TSchema extends z.ZodTypeAny>(
	node: TNode,
	schema: TSchema
): Omit<TNode, 'metadata'> & { metadata: z.infer<TSchema> } {
	return {
		...node,
		metadata: schema.parse(node.metadata)
	};
}

export { parseMetadata };
