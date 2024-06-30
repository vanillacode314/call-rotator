import type { TNode } from 'schema/db';

function isFolder(node: TNode) {
	return node.listId === null;
}

export { isFolder };
