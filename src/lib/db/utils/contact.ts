import { contactMetadataSchema } from '$/types/contact';
import { isEmpty } from '$/utils';
import { parseMetadata } from '$/utils/types';
import { query as nodesQuery } from './nodes';

const query = {
	getContactsById(id: number) {
		return nodesQuery.getChildrenById(id, { pattern: '%.contacts' });
	},
	getContactsByPath(path: string) {
		return nodesQuery.getChildrenByPath(path, { pattern: '%.contacts' });
	},
	async getContactsByIdsAndPhone(contacts: TListMetadata['contacts']) {
		if (isEmpty(contacts)) return [];
		const nodes = (await nodesQuery.getNodesByIds(Object.keys(contacts).map(Number))).map((node) =>
			parseMetadata(node, contactMetadataSchema)
		);
		let retval: (TContact & { nodeId: TNode['id'] })[] = [];
		for (const node of nodes) {
			retval.push(
				...node.metadata.contacts
					.filter((contact) => contacts[node.id].includes(contact.phone))
					.map((contact) => Object.assign(contact, { nodeId: node.id }))
			);
		}
		return retval;
	}
};

export { query };
