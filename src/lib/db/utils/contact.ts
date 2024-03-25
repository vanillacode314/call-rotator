import { query as nodesQuery } from './nodes';

const query = {
	getContactsById(id: number) {
		return nodesQuery.getChildrenById(id, '%.contacts');
	},
	getContactsByPath(path: string) {
		return nodesQuery.getChildrenByPath(path, '%.contacts');
	}
};

export { query };
